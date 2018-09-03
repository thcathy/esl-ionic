import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Dictation, SuitableStudentOptions} from "../../entity/dictation";
import {EditDictationRequest, MemberDictationService} from "../../services/dictation/member-dictation.service";
import {NavigationService} from "../../services/navigation.service";
import {AuthService} from "../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {DictationService} from "../../services/dictation/dictation.service";
import {ValidationUtils} from "../../utils/validation-utils";
import {IonicComponentService} from "../../services/ionic-component.service";
import {Storage} from "@ionic/storage";

@Component({
  selector: 'app-edit-dictation',
  templateUrl: './edit-dictation.page.html',
  styleUrls: ['./edit-dictation.page.scss'],
})
export class EditDictationPage implements OnInit {
  inputForm: FormGroup;
  loader: any;
  dictation: Dictation;
  isEdit: boolean;
  suitableStudentOptions = SuitableStudentOptions;

  constructor(
    public formBuilder: FormBuilder,
    public memberDictationService: MemberDictationService,
    public navService: NavigationService,
    public authService: AuthService,
    public translate: TranslateService,
    public dictationService: DictationService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  ionViewDidEnter() {
    this.init();
  }

  async init() {
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    if (!this.authService.isAuthenticated()) {
      this.authService.login({
        destination: 'EditDictationPage',
        params: {dictation: this.dictation}
      });
      return;
    }
    this.isEdit = this.dictation != null;
    this.setupForm(this.dictation);
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

  get title() { return this.inputForm.get('title'); }
  get now() { return new Date(); }
  get description() { return this.inputForm.get('description'); }
  get vocabulary() { return this.inputForm.get('vocabulary'); }
  get article() { return this.inputForm.get('article'); }
  get showImage() { return this.inputForm.get('showImage'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }
  get type() { return this.inputForm.get('type'); }

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

  async saveDictation() {
    if (this.isEmptyDictation()) {
      return;
    }
    this.loader = await this.ionicComponentService.showLoading();
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
    this.ionicComponentService.showAlert(this.translate.instant('Cannot find any word or sentence'));

    return true;
  }

  viewDictation(dictation: Dictation) {
    this.translate.get('UpdatedDictation', {title: dictation.title}).subscribe((msg: string) => {
      this.navService.openDictation(dictation, msg);
    });
  }

  showError(_err: string) {
    this.loader.dismiss();
    this.ionicComponentService.showAlert(this.translate.instant('Fail to create or update dictation'));
  }

}

export function maxVocabularyValidator(max: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const tooLarge = control.value != null && control.value.split(/[\s,]+/).length > max;
    return tooLarge ? {'maxVocabulary': {value: control.value}} : null;
  };
}