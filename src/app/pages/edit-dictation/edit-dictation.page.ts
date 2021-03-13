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
import {ActivatedRoute} from '@angular/router';
import {Vocab} from '../../entity/vocab';
import {AlertController} from '@ionic/angular';
import {ArticleDictationService} from '../../services/dictation/article-dictation.service';
import {DictationType, EditDictationPageMode} from './edit-dictation-page-enum';

@Component({
  selector: 'app-edit-dictation',
  templateUrl: './edit-dictation.page.html',
  styleUrls: ['./edit-dictation.page.scss'],
})
export class EditDictationPage implements OnInit, CanComponentDeactivate {
  inputForm: FormGroup;
  loader: any;
  dictation: Dictation;
  mode: EditDictationPageMode = EditDictationPageMode.Edit;
  isSaved: boolean;
  suitableStudentOptions = SuitableStudentOptions;
  sentenceLengthOptions = SentenceLengthOptions;
  isPreview = false;
  questions: string[];
  isInitialized: boolean;

  constructor(
    public formBuilder: FormBuilder,
    public memberDictationService: MemberDictationService,
    public navService: NavigationService,
    public authService: AuthService,
    public translate: TranslateService,
    public dictationService: DictationService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
    public alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private articleDictationService: ArticleDictationService,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.isInitialized = false;
    this.mode = EditDictationPageMode[this.activatedRoute.snapshot.paramMap?.get('mode')] || EditDictationPageMode.Edit;
    this.createForm();
    this.init().then(() => { this.isInitialized = true; });
  }

  getTitle(): String {
    if (this.mode === EditDictationPageMode.Start) {
      return 'Start Dictation';
    } else {
      return 'Create Dictation';
    }
  }

  async init() {
    if (!this.authService.isAuthenticated() && this.mode !== EditDictationPageMode.Start) {
      this.authService.login({
        destination: '/edit-dictation',
        params: {dictation: this.dictation}
      });
      return;
    }

    this.isSaved = false;
    this.isPreview = false;
    this.dictation = await this.storage.get(NavigationService.storageKeys.editDictation);
    this.setupForm(this.dictation);
  }

  createForm() {
    if (this.mode === EditDictationPageMode.Edit) {
      this.inputForm = this.formBuilder.group({
        'title': new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]),
        'description': new FormControl('', [Validators.maxLength(100)]),
        'showImage': true,
        'vocabulary': new FormControl('', [maxVocabularyValidator(50), Validators.pattern('^([a-zA-Z\\s]+[\\-,]?)+')]),
        'article': '',
        'type': DictationType.Word,
        'suitableStudent': 'Any',
        'sentenceLength': 'Normal',
      });
      this.inputForm.get('suitableStudent').setValue('Any');
    } else {
      this.inputForm = this.formBuilder.group({
        'showImage': true,
        'vocabulary': new FormControl('', [maxVocabularyValidator(50), Validators.pattern('^([a-zA-Z\\s]+[\\-,]?)+')]),
        'article': '',
        'type': DictationType.Word,
        'sentenceLength': 'Normal',
      });
    }

    this.inputForm.get('sentenceLength').setValue('Normal');

    this.inputForm.valueChanges.subscribe(val => {
      this.closePreview();
    });
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

  get pageMode() { return EditDictationPageMode; }

  get dictationType() { return DictationType; }

  setupForm(dictation: Dictation) {
    if (dictation == null) { return; }

    if (dictation.sentenceLength) { this.sentenceLength.setValue(dictation.sentenceLength); }
    if (this.dictationService.isSentenceDictation(dictation)) {
      this.type.setValue(DictationType.Sentence);
      this.article.setValue(dictation.article);
    } else {
      this.type.setValue(DictationType.Word);
      this.vocabulary.setValue(dictation.vocabs.map(v => v.word).join(' '));
      this.showImage.setValue(dictation.showImage);
    }

    if (!this.dictationService.isInstantDictation(dictation)) {
      this.title.setValue(dictation.title);
      this.description.setValue(dictation.description);
      this.suitableStudent.setValue(dictation.suitableStudent);
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
      vocabulary: this.type.value === DictationType.Word ?  vocabularyValueToArray(this.vocabulary.value) : [],
      article: this.type.value === DictationType.Sentence ? this.article.value : '',
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
    if (this.mode === EditDictationPageMode.Start) {
      return true;
    }
    return this.ionicComponentService.confirmExit();
  }

  get editDictationPageMode(): typeof EditDictationPageMode {
    return EditDictationPageMode;
  }

  startDictationNow() {
    if (this.isEmptyDictation()) {
      return;
    }
    const d = this.prepareDictation();
    this.navService.startDictation(d);
  }

  prepareDictation(): Dictation {
    if (this.type.value === DictationType.Word) {
      return <Dictation>{
        id: -1,
        showImage: this.showImage.value as boolean,
        vocabs: vocabularyValueToArray(this.vocabulary.value).map(v => new Vocab(v)),
        totalRecommended: 0,
        title: new Date().toDateString(),
        suitableStudent: 'Any',
      };
    } else {
      return <Dictation>{
        id: -1,
        sentenceLength: this.sentenceLength.value,
        article: this.article.value,
        totalRecommended: 0,
        title: new Date().toDateString(),
        suitableStudent: 'Any',
      };
    }
  }

  preview() {
    this.isPreview = true;

    if (this.type.value === DictationType.Word) {
      this.questions = vocabularyValueToArray(this.vocabulary.value);
    } else {
      this.questions = this.articleDictationService.divideToSentences(this.article.value, this.articleDictationService.sentenceLengthOptionsToValue(this.sentenceLength.value));
    }

  }

  closePreview() {
    if (this.isPreview) {
      this.isPreview = false;
      document.getElementById('ion-col-textarea')?.scrollIntoView();
    }
  }

}

export function maxVocabularyValidator(max: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const tooLarge = control.value != null && vocabularyValueToArray(control.value).length > max;
    return tooLarge ? {'maxVocabulary': {value: control.value}} : null;
  };
}

function vocabularyValueToArray(input: string): string[] {
  return input.split(/[\s,]+/)
          .filter(v => !ValidationUtils.isBlankString(v));
}
