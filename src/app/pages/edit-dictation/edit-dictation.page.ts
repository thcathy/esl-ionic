import {Component, OnInit, ViewChild} from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {Dictation, Dictations, SentenceLengthOptions, SuitableStudentOptions} from '../../entity/dictation';
import {Vocab} from '../../entity/vocab';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {CanComponentDeactivate} from '../../guards/can-deactivate.guard';
import {FFSAuthService} from '../../services/auth.service';
import {ArticleDictationService} from '../../services/dictation/article-dictation.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {EditDictationRequest, MemberDictationService} from '../../services/dictation/member-dictation.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NavigationService} from '../../services/navigation.service';
import {SpeechService} from '../../services/speech.service';
import {UIOptionsService} from '../../services/ui-options.service';
import {DictationUtils} from '../../utils/dictation-utils';
import {DictationType, EditDictationPageMode} from './edit-dictation-page-enum';
import {ArticleDictationOptionsComponent} from "../../components/article-dictation-options/article-dictation-options.component";
import Source = Dictations.Source;

type SavedOptionSnapshot = {
  voiceMode: string;
  type: DictationType;
  sentenceLength: string;
  showImage: boolean;
  includeAIImage: boolean;
  wordContainSpace: boolean;
  wordPracticeType: VocabPracticeType;
};

@Component({
    selector: 'app-edit-dictation',
    templateUrl: './edit-dictation.page.html',
    styleUrls: ['./edit-dictation.page.scss'],
    standalone: false
})
export class EditDictationPage implements OnInit, CanComponentDeactivate {
  private static readonly defaultSavedOptions: SavedOptionSnapshot = {
    voiceMode: UIOptionsService.voiceMode.online,
    type: DictationType.Word,
    sentenceLength: 'Normal',
    showImage: true,
    includeAIImage: false,
    wordContainSpace: false,
    wordPracticeType: VocabPracticeType.Spell,
  };

  inputForm: UntypedFormGroup;
  loader: any;
  dictation: Dictation;
  mode: EditDictationPageMode = EditDictationPageMode.Edit;
  isSaved: boolean;
  suitableStudentOptions = SuitableStudentOptions;
  sentenceLengthOptions = SentenceLengthOptions;
  isPreview = false;
  questions: string[];
  private savedOptions: SavedOptionSnapshot = {...EditDictationPage.defaultSavedOptions};

  @ViewChild('articleDictationOptions') articleDictationOptions: ArticleDictationOptionsComponent;

  constructor(
    public formBuilder: UntypedFormBuilder,
    public memberDictationService: MemberDictationService,
    public navService: NavigationService,
    public authService: FFSAuthService,
    public translate: TranslateService,
    public dictationService: DictationService,
    public ionicComponentService: IonicComponentService,
    private speechService: SpeechService,
    private uiOptionsService: UIOptionsService,
    private activatedRoute: ActivatedRoute,
    private articleDictationService: ArticleDictationService,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter() {
    this.mode = EditDictationPageMode[this.activatedRoute.snapshot.paramMap?.get('mode')] || EditDictationPageMode.Edit;
    await this.loadSavedOptions();
    this.createForm();
    this.init();
  }

  getTitle(): string {
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
    this.syncIncludeAiImageState();
  }

  createForm() {
    const controlsConfig = {};
    controlsConfig['showImage'] = this.savedOptions.showImage;
    controlsConfig['wordContainSpace'] = this.savedOptions.wordContainSpace;
    controlsConfig['question'] = new UntypedFormControl('', [Validators.required]);
    controlsConfig['type'] = this.savedOptions.type;
    controlsConfig['sentenceLength'] = this.savedOptions.sentenceLength;
    controlsConfig['wordPracticeType'] = this.savedOptions.wordPracticeType;
    controlsConfig['voiceMode'] = this.savedOptions.voiceMode;
    controlsConfig['includeAIImage'] = this.savedOptions.includeAIImage;

    if (this.mode === EditDictationPageMode.Edit) {
      controlsConfig['title'] = new UntypedFormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]);
      controlsConfig['description'] = new UntypedFormControl('', [Validators.maxLength(100)]);
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

    this.inputForm.valueChanges.subscribe(() => {
      this.closePreview();
    });
    this.showImage.valueChanges.subscribe(() => this.syncIncludeAiImageState());
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
  get includeAIImage() { return this.inputForm.get('includeAIImage'); }
  get voiceMode() { return this.inputForm.get('voiceMode'); }

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
      this.applyWordDictationFormValue(dictation);
    }

    if (!this.dictationService.isInstantDictation(dictation)) {
      this.applyEditableDictationFormValue(dictation);
    }
  }

  async saveDictation() {
    this.persistOptions();
    this.loader = await this.ionicComponentService.showLoading();
    this.memberDictationService.createOrAmendDictation(<EditDictationRequest>{
      dictationId: this.dictation ? this.dictation.id : -1,
      title: this.title.value,
      description: this.description.value,
      showImage: this.showImage.value,
      includeAIImage: this.includeAIImage.value,
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
    this.persistOptions();
    const d = this.prepareDictation();
    this.navService.startDictation(d);
  }

  private persistOptions() {
    const options = {
      [UIOptionsService.keys.ttsVoiceMode]: this.voiceMode.value || UIOptionsService.voiceMode.online,
      [UIOptionsService.keys.editDictationType]: this.type.value || DictationType.Word,
      [UIOptionsService.keys.editDictationSentenceLength]: this.sentenceLength.value || 'Normal',
      [UIOptionsService.keys.editDictationShowImage]: this.showImage.value === true,
      [UIOptionsService.keys.editDictationIncludeAIImage]: this.includeAIImage?.value === true,
      [UIOptionsService.keys.editDictationWordContainSpace]: this.wordContainSpace.value === true,
      [UIOptionsService.keys.editDictationWordPracticeType]: this.wordPracticeType.value || VocabPracticeType.Spell,
    };

    Object.entries(options).forEach(([key, value]) => this.uiOptionsService.saveOption(key, value));
  }

  private resolveVoiceMode(mode: string): string {
    return mode === UIOptionsService.voiceMode.local || mode === UIOptionsService.voiceMode.online
      ? mode
      : UIOptionsService.voiceMode.online;
  }

  onVoiceModeChange(mode: string): void {
    const resolvedMode = this.resolveVoiceMode(mode);
    this.voiceMode.setValue(resolvedMode);
    void this.uiOptionsService
      .saveOption(UIOptionsService.keys.ttsVoiceMode, resolvedMode)
      .then(() => this.speechService.ensureVoiceModeLoaded());
  }

  private async loadSavedOptions() {
    const [
      savedVoiceMode,
      savedType,
      savedSentenceLength,
      savedShowImage,
      savedIncludeAiImage,
      savedWordContainSpace,
      savedWordPracticeType,
    ] = await Promise.all([
      this.uiOptionsService.loadOption(UIOptionsService.keys.ttsVoiceMode),
      this.uiOptionsService.loadOption(UIOptionsService.keys.editDictationType),
      this.uiOptionsService.loadOption(UIOptionsService.keys.editDictationSentenceLength),
      this.uiOptionsService.loadOption(UIOptionsService.keys.editDictationShowImage),
      this.uiOptionsService.loadOption(UIOptionsService.keys.editDictationIncludeAIImage),
      this.uiOptionsService.loadOption(UIOptionsService.keys.editDictationWordContainSpace),
      this.uiOptionsService.loadOption(UIOptionsService.keys.editDictationWordPracticeType),
    ]);

    this.savedOptions = {
      voiceMode: this.resolveVoiceMode(savedVoiceMode),
      type: this.resolveType(savedType),
      sentenceLength: this.resolveSentenceLength(savedSentenceLength),
      showImage: this.toBoolean(savedShowImage),
      includeAIImage: this.toBoolean(savedIncludeAiImage),
      wordContainSpace: this.toBoolean(savedWordContainSpace),
      wordPracticeType: this.resolveWordPracticeType(savedWordPracticeType),
    };
  }

  private resolveType(type: string): DictationType {
    return type === DictationType.Sentence ? DictationType.Sentence : DictationType.Word;
  }

  private resolveSentenceLength(sentenceLength: string): string {
    return this.sentenceLengthOptions.includes(sentenceLength) ? sentenceLength : 'Normal';
  }

  private resolveWordPracticeType(practiceType: VocabPracticeType): VocabPracticeType {
    return practiceType === VocabPracticeType.Puzzle ? VocabPracticeType.Puzzle : VocabPracticeType.Spell;
  }

  private toBoolean(value: unknown): boolean {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  private applyWordDictationFormValue(dictation: Dictation) {
    this.type.setValue(DictationType.Word);
    this.question.setValue(dictation.vocabs.map(v => v.word).join(dictation.wordContainSpace ? '\n' : ' '));
    this.showImage.setValue(this.toBoolean(dictation.showImage));
    this.includeAIImage.setValue(this.toBoolean(dictation.includeAIImage));
    this.wordContainSpace.setValue(this.toBoolean(dictation.wordContainSpace));
    this.wordPracticeType.setValue(this.resolveWordPracticeType(dictation?.options?.practiceType));
  }

  private applyEditableDictationFormValue(dictation: Dictation) {
    this.title.setValue(dictation.title);
    this.description.setValue(dictation.description);
    this.suitableStudent.setValue(dictation.suitableStudent);
    this.includeAIImage.setValue(this.toBoolean(dictation.includeAIImage));
  }

  private syncIncludeAiImageState() {
    if (!this.includeAIImage) {
      return;
    }
    if (this.showImage.value === true) {
      this.includeAIImage.enable({emitEvent: false});
      return;
    }

    this.includeAIImage.setValue(false, {emitEvent: false});
    this.includeAIImage.disable({emitEvent: false});
  }

  prepareDictation(): Dictation {
    if (this.type.value === DictationType.Word) {
      return <Dictation>{
        id: -1,
        showImage: this.showImage.value as boolean,
        includeAIImage: this.includeAIImage?.value === true,
        vocabs: DictationUtils.vocabularyValueToArray(this.question.value, this.wordContainSpace.value).map(v => new Vocab(v)),
        totalRecommended: 0,
        title: new Date().toDateString(),
        suitableStudent: 'Any',
        wordContainSpace: this.wordContainSpace.value,
        options: {
          practiceType : this.wordPracticeType.value,
          voiceMode: this.voiceMode.value || UIOptionsService.voiceMode.online,
        },
        source: Dictations.Source.FillIn,
      };
    } else {
      return <Dictation>{
        id: -1,
        sentenceLength: this.sentenceLength.value,
        article: this.question.value,
        totalRecommended: 0,
        title: new Date().toDateString(),
        suitableStudent: 'Any',
        source: Dictations.Source.FillIn,
        options: {
          voiceMode: this.voiceMode.value || UIOptionsService.voiceMode.online,
          caseSensitiveSentence : this.articleDictationOptions.caseSensitive.checked,
          checkPunctuation: this.articleDictationOptions.checkPunctuation.checked,
          speakPunctuation: this.articleDictationOptions.speakPunctuation.checked,
        },
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
