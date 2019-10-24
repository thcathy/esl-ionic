import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Dictation, SentenceLengthOptions, SuitableStudentOptions} from '../../entity/dictation';
import {EditDictationRequest, MemberDictationService} from '../../services/dictation/member-dictation.service';
import {NavigationService} from '../../services/navigation.service';
import {AuthService} from '../../services/auth.service';
import {TranslateService} from '@ngx-translate/core';
import {DictationService} from '../../services/dictation/dictation.service';
import {ValidationUtils} from '../../utils/validation-utils';
import {IonicComponentService} from '../../services/ionic-component.service';
import {Storage} from '@ionic/storage';
import {CanComponentDeactivate} from '../../guards/can-deactivate.guard';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-edit-dictation',
  templateUrl: './edit-dictation.page.html',
  styleUrls: ['./edit-dictation.page.scss'],
})
export class EditDictationPage implements OnInit, CanComponentDeactivate {
  inputForm: FormGroup;
  loader: any;
  dictation: Dictation;
  isEdit: boolean;
  isSaved: boolean;
  suitableStudentOptions = SuitableStudentOptions;
  sentenceLengthOptions = SentenceLengthOptions;

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

  }

  ionViewDidEnter() {
    this.createForm();
    this.init();
  }

  async init() {
    this.isSaved = false;
    this.dictation = await this.storage.get(NavigationService.storageKeys.editDictation);
    this.isEdit = this.dictation != null;
    this.setupForm(this.dictation);

    if (!this.authService.isAuthenticated()) {
      this.authService.login({
        destination: '/edit-dictation',
        params: {dictation: this.dictation}
      });
      return;
    }
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'title': new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]),
      'description': new FormControl('', [Validators.maxLength(100)]),
      'showImage': true,
      'vocabulary': new FormControl('', [maxVocabularyValidator(50), Validators.pattern('^([a-zA-Z\\s]+[\\-,]?)+')]),
      'article': '',
      'type': 'word',
      'suitableStudent': 'Any',
      'sentenceLength': 'Normal',
    });
    this.inputForm.get('suitableStudent').setValue('Any');
    this.inputForm.get('sentenceLength').setValue('Normal');
  }

  get title() { return this.inputForm.get('title'); }
  get now() { return new Date(); }
  get description() { return this.inputForm.get('description'); }
  get vocabulary() { return this.inputForm.get('vocabulary'); }
  get article() { return this.inputForm.get('article'); }
  get showImage() { return this.inputForm.get('showImage'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }
  get sentenceLength() { return this.inputForm.get('sentenceLength'); }
  get type() { return this.inputForm.get('type'); }

  setupForm(dictation: Dictation) {
    if (dictation == null) { return; }

    this.title.setValue(dictation.title);
    this.description.setValue(dictation.description);
    this.showImage.setValue(dictation.showImage);
    this.suitableStudent.setValue(dictation.suitableStudent);
    if (dictation.sentenceLength) this.sentenceLength.setValue(dictation.sentenceLength);
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
      vocabulary: this.type.value === 'word' ?  this.vocabulary.value.split(/[\s,]+/).filter(v => !ValidationUtils.isBlankString(v)) : [],
      article: this.type.value === 'sentence' ? this.article.value : '',
      suitableStudent: this.suitableStudent.value,
      sentenceLength: this.sentenceLength.value,
    }).subscribe(
      dic => this.afterSaved(dic),
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

  afterSaved(dictation: Dictation) {

    this.dictation = null;
    this.isSaved = true;
    this.storage.remove(NavigationService.storageKeys.editDictation);

    if (this.loader) { this.loader.dismiss(); }
    this.translate.get('UpdatedDictation', {title: dictation.title}).subscribe(msg => {
      this.navService.openDictation(dictation, msg);
    });
  }

  showError(_err: string) {
    if (this.loader) { this.loader.dismiss(); }
    this.ionicComponentService.showAlert(this.translate.instant('Fail to create or update dictation'));
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.inputForm || !this.inputForm.dirty || this.isSaved) {
      return true;
    }
    return this.ionicComponentService.confirmExit();
  }
}

export function maxVocabularyValidator(max: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const tooLarge = control.value != null && control.value.split(/[\s,]+/).length > max;
    return tooLarge ? {'maxVocabulary': {value: control.value}} : null;
  };
}
