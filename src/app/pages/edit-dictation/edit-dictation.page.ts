import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Dictation, Dictations, SentenceLengthOptions, SuitableStudentOptions} from '../../entity/dictation';
import {EditDictationRequest, MemberDictationService} from '../../services/dictation/member-dictation.service';
import {NavigationService} from '../../services/navigation.service';
import {AuthService} from '../../services/auth.service';
import {TranslateService} from '@ngx-translate/core';
import {DictationService} from '../../services/dictation/dictation.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {CanComponentDeactivate} from '../../guards/can-deactivate.guard';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Vocab} from '../../entity/vocab';
import {AlertController} from '@ionic/angular';
import {ArticleDictationService} from '../../services/dictation/article-dictation.service';
import {DictationType, EditDictationPageMode} from './edit-dictation-page-enum';
import {DictationUtils} from '../../utils/dictation-utils';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import Source = Dictations.Source;

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

  constructor(
    public formBuilder: FormBuilder,
    public memberDictationService: MemberDictationService,
    public navService: NavigationService,
    public authService: AuthService,
    public translate: TranslateService,
    public dictationService: DictationService,
    public ionicComponentService: IonicComponentService,
    public alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private articleDictationService: ArticleDictationService,
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.mode = EditDictationPageMode[this.activatedRoute.snapshot.paramMap?.get('mode')] || EditDictationPageMode.Edit;
    this.createForm();
    this.init();
  }

  getTitle(): String {
    if (this.mode === EditDictationPageMode.Start) {
      return 'Start Dictation';
    } else {
      return 'Create Dictation';
    }
  }

  init() {
    if (!this.authService.isAuthenticated() && this.mode !== EditDictationPageMode.Start) {
      const params = {};
      params[NavigationService.storageKeys.editDictation] = this.navService.getParam(NavigationService.storageKeys.editDictation);
      this.authService.login({
        destination: '/edit-dictation',
        params: params
      });
      return;
    }

    this.isSaved = false;
    this.isPreview = false;
    this.dictation = this.navService.getParam(NavigationService.storageKeys.editDictation);
    this.setupFormValue(this.dictation);
  }

  createForm() {
    const controlsConfig = {};
    controlsConfig['showImage'] = true;
    controlsConfig['wordContainSpace'] = false;
    controlsConfig['question'] = new FormControl('', [Validators.required]);
    controlsConfig['type'] = DictationType.Word;
    controlsConfig['sentenceLength'] = 'Normal';
    controlsConfig['wordPracticeType'] = VocabPracticeType.Spell;

    if (this.mode === EditDictationPageMode.Edit) {
      controlsConfig['title'] = new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]);
      controlsConfig['description'] = new FormControl('', [Validators.maxLength(100)]);
      controlsConfig['suitableStudent'] = 'Any';
    }
    this.inputForm = this.formBuilder.group(
      controlsConfig,
      {
        validators: [
          maxVocabularyValidator(50, 'type', 'question', 'wordContainSpace'),
          vocabularyPatternValidator('type', 'question')
        ]
      });

    this.inputForm.valueChanges.subscribe(val => {
      this.closePreview();
    });
  }

  get title() { return this.inputForm.get('title'); }
  get now() { return new Date(); }
  get description() { return this.inputForm.get('description'); }
  get question() { return this.inputForm.get('question'); }
  get showImage() { return this.inputForm.get('showImage'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }
  get sentenceLength() { return this.inputForm.get('sentenceLength'); }
  get type() { return this.inputForm.get('type'); }
  get wordContainSpace() { return this.inputForm.get('wordContainSpace'); }
  get wordPracticeType() { return this.inputForm.get('wordPracticeType'); }

  get practiceType() { return VocabPracticeType; }
  get pageMode() { return EditDictationPageMode; }
  get dictationType() { return DictationType; }

  setupFormValue(dictation: Dictation) {
    if (dictation == null) { return; }

    if (dictation.sentenceLength) { this.sentenceLength.setValue(dictation.sentenceLength); }
    if (this.dictationService.isSentenceDictation(dictation)) {
      this.type.setValue(DictationType.Sentence);
      this.question.setValue(dictation.article);
    } else {
      this.type.setValue(DictationType.Word);
      this.question.setValue(dictation.vocabs.map(v => v.word).join(dictation.wordContainSpace ? '\n' : ' '));
      this.showImage.setValue(dictation.showImage);
      this.wordContainSpace.setValue(dictation.wordContainSpace);
      this.wordPracticeType.setValue(dictation?.options?.practiceType);
    }

    if (!this.dictationService.isInstantDictation(dictation)) {
      this.title.setValue(dictation.title);
      this.description.setValue(dictation.description);
      this.suitableStudent.setValue(dictation.suitableStudent);
    }
  }

  async saveDictation() {
    this.loader = await this.ionicComponentService.showLoading();
    this.memberDictationService.createOrAmendDictation(<EditDictationRequest>{
      dictationId: this.dictation ? this.dictation.id : -1,
      title: this.title.value,
      description: this.description.value,
      showImage: this.showImage.value,
      vocabulary: this.type.value === DictationType.Word ?  DictationUtils.vocabularyValueToArray(this.question.value, this.wordContainSpace.value) : [],
      article: this.type.value === DictationType.Sentence ? this.question.value : '',
      suitableStudent: this.suitableStudent.value,
      sentenceLength: this.sentenceLength.value,
      wordContainSpace : this.wordContainSpace.value,
      source : Source.FillIn,
    }).subscribe(
      dic => this.afterSaved(dic),
      err => this.showError(err)
    );
  }

  afterSaved(dictation: Dictation) {
    this.dictation = null;
    this.isSaved = true;
    this.navService.setParam(NavigationService.storageKeys.editDictation, null);

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
    const d = this.prepareDictation();
    this.navService.startDictation(d);
  }

  prepareDictation(): Dictation {
    if (this.type.value === DictationType.Word) {
      return <Dictation>{
        id: -1,
        showImage: this.showImage.value as boolean,
        vocabs: DictationUtils.vocabularyValueToArray(this.question.value, this.wordContainSpace.value).map(v => new Vocab(v)),
        totalRecommended: 0,
        title: new Date().toDateString(),
        suitableStudent: 'Any',
        wordContainSpace: this.wordContainSpace.value,
        options: { 'practiceType' : this.wordPracticeType.value },
        source: Dictations.Source.Generate,
      };
    } else {
      return <Dictation>{
        id: -1,
        sentenceLength: this.sentenceLength.value,
        article: this.question.value,
        totalRecommended: 0,
        title: new Date().toDateString(),
        suitableStudent: 'Any',
        source: Dictations.Source.Generate,
      };
    }
  }

  preview() {
    this.isPreview = true;

    if (this.type.value === DictationType.Word) {
      this.questions = DictationUtils.vocabularyValueToArray(this.question.value, this.wordContainSpace.value);
    } else {
      this.questions = this.articleDictationService.divideToSentences(this.question.value, this.articleDictationService.sentenceLengthOptionsToValue(this.sentenceLength.value));
    }

  }

  closePreview() {
    if (this.isPreview) {
      this.isPreview = false;
      document.getElementById('ion-col-textarea')?.scrollIntoView();
    }
  }

}

function maxVocabularyValidator(max: number, typeName: string, questionName: string, wordContainSpaceName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const type = control.get(typeName).value;
    if (type == null || type === DictationType.Sentence) { return null; }

    const question = control.get(questionName).value;
    const tooLarge = question != null && DictationUtils.vocabularyValueToArray(question, control.get(wordContainSpaceName).value).length > max;
    return tooLarge ? {'maxVocabulary': true} : null;
  };
}

function vocabularyPatternValidator(typeName: string, questionName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const type = control.get(typeName)?.value;
    if (type == null || type === DictationType.Sentence) { return null; }

    const question = control.get(questionName)?.value;
    const valid = question != null && question !== '' && DictationUtils.vocabularyValueToArray(question, control.get(questionName).value).length <= 0;
    return valid ? {'invalidVocabularyPattern': true} : null;
  };
}
