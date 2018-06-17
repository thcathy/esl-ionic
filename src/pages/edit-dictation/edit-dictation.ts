import { Component } from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {
  EditDictationRequest,
  MemberDictationService
} from "../../providers/dictation/member-dictation.service";
import {Dictation} from "../../entity/dictation";
import {NavigationService} from "../../providers/navigation.service";
import {Loading} from "ionic-angular/components/loading/loading";
import {AuthService} from "../../providers/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {SuitableStudentOptions} from "../../entity/dictation";
import {Observable} from 'rxjs/Rx'
import 'rxjs/add/operator/combineLatest';
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {ValidationUtils} from "../../utils/validation-utils";
import {DictationService} from "../../providers/dictation/dictation.service";

@IonicPage()
@Component({
  selector: 'page-edit-dictation',
  templateUrl: 'edit-dictation.html',
})
export class EditDictationPage {
  inputForm: FormGroup;
  loader: Loading;
  dictation: Dictation;
  isEdit: boolean;
  suitableStudentOptions = SuitableStudentOptions;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public formBuilder: FormBuilder,
              public memberDictationService: MemberDictationService,
              public navService: NavigationService,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public authService: AuthService,
              public translate: TranslateService,
              public ga: GoogleAnalytics,
              public dictationService: DictationService,
  ) {
    if (!this.authService.isAuthenticated()) {
      this.authService.login({
        destination: 'EditDictationPage',
        params: {dictation: navParams.get('dictation')}
      });
      return;
    }

    this.createForm();
    this.dictation = navParams.get('dictation');
    this.isEdit = this.dictation != null;
    this.setupForm(this.dictation);
  }

  get title() { return this.inputForm.get('title'); }
  get now() { return new Date(); }
  get description() { return this.inputForm.get('description'); }
  get vocabulary() { return this.inputForm.get('vocabulary'); }
  get article() { return this.inputForm.get('article'); }
  get showImage() { return this.inputForm.get('showImage'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }
  get type() { return this.inputForm.get('type'); }

  ionViewWillEnter() {
    this.ga.trackView('edit-dictation')
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'title': new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]),
      'description': new FormControl('', [Validators.maxLength(100)]),
      'showImage': true,
      'vocabulary': new FormControl('', [maxVocabularyValidator(50), Validators.pattern("^([a-zA-Z ]+[\\-,]?)+")]),
      'article': '',
      'type': 'word',
      'suitableStudent': 'Any',
    });
    this.inputForm.get('suitableStudent').setValue('Any');
  }

  setupForm(dictation: Dictation) {
    if (dictation == null) return;

    this.title.setValue(dictation.title);
    this.description.setValue(dictation.description);
    this.showImage.setValue(dictation.showImage);
    this.suitableStudent.setValue(dictation.suitableStudent);
    if (this.dictationService.isSentenceDictation(dictation)) {
      this.type.setValue('sentence');
      this.article.setValue(dictation.article);
    } else {
      this.type.setValue('word');
      this.vocabulary.setValue(dictation.vocabs.map(v => v.word).join(' '));
    }
  }

  saveDictation() {
    if (this.isEmptyDictation()) {
      return;
    }

    this.loader = this.loadingCtrl.create({ content: this.translate.instant('Please wait') + "..." });
    this.memberDictationService.createOrAmendDictation(<EditDictationRequest>{
      dictationId: this.dictation ? this.dictation.id : -1,
      title: this.title.value,
      description: this.description.value,
      showImage: this.showImage.value,
      vocabulary: this.type.value == 'word' ?  this.vocabulary.value.split(/[\s,]+/).filter(v => !ValidationUtils.isBlankString(v)) : [],
      article: this.type.value == 'sentence' ? this.article.value : '',
      suitableStudent: this.suitableStudent.value
    }).subscribe(
      dic => this.viewDictation(dic),
        err => this.showError(err)
    );
  }

  isEmptyDictation() {
    if (!ValidationUtils.isBlankString(this.vocabulary.value)
      || !ValidationUtils.isBlankString(this.article.value)) {
      return false;
    }

    let alert = this.alertCtrl.create({
      title: `${this.translate.instant('Cannot find any word or sentence')}!`,
      subTitle: '',
      buttons: [this.translate.instant('OK')]
    });
    alert.present();

    return true;
  }

  viewDictation(dictation: Dictation) {
    this.translate.get('UpdatedDictation', {title: dictation.title}).subscribe((msg: string) => {
      this.navService.openDictation(dictation, msg);
    });
  }

  showError(_err: string) {
    this.loader.dismissAll();
    const title =  this.translate.get('Fail to create or update dictation');
    const button = this.translate.get('OK');

    Observable.combineLatest(title, button).subscribe(([titleString, buttonString])=>{
      let alert = this.alertCtrl.create({
        title: titleString,
        buttons: [buttonString]
      });
      alert.present();
    });
  }

}

export function maxVocabularyValidator(max: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const tooLarge = control.value != null && control.value.split(/[\s,]+/).length > max;
    return tooLarge ? {'maxVocabulary': {value: control.value}} : null;
  };
}
