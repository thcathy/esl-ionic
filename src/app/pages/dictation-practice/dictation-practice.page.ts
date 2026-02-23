import {Component, OnInit, ViewChild} from '@angular/core';
import {IonInput} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {NGXLogger} from 'ngx-logger';
import {of, Subject} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {VirtualKeyboardEvent} from '../../components/virtual-keyboard/virtual-keyboard';
import {Dictation, PuzzleControls} from '../../entity/dictation';
import {VocabPractice} from '../../entity/voacb-practice';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {DictationHelper} from '../../services/dictation/dictation-helper.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NavigationService} from '../../services/navigation.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {SpeechService} from '../../services/speech.service';
import {StorageService} from '../../services/storage.service';
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-dictation-practice',
    templateUrl: './dictation-practice.page.html',
    styleUrls: ['./dictation-practice.page.scss'],
    standalone: false
})
export class DictationPracticePage implements OnInit {
  @ViewChild('answerInput') answerInput: IonInput;

  dictation: Dictation;
  dictationId: number;
  vocabPractices: VocabPractice[] = [];
  questionIndex: number;
  totalQuestions: number = 0;
  phonics: string;
  answer: string;
  mark = 0;
  histories: VocabPracticeHistory[] = [];
  loading: any;
  isKeyboardActive: boolean;
  puzzleControls: PuzzleControls;
  speak$ = new Subject<boolean>();

  constructor(
    public route: ActivatedRoute,
    public vocabPracticeService: VocabPracticeService,
    public dictationService: DictationService,
    public speechService: SpeechService,
    public navigationService: NavigationService,
    public ionicComponentService: IonicComponentService,
    public storage: StorageService,
    public dictationHelper: DictationHelper,
    public translate: TranslateService,
    private log: NGXLogger,
  ) { }

  ngOnInit() {      }

  ionViewWillEnter() {
    this.clearVaribles();
    void this.speechService.ensureVoiceModeLoaded();
    this.initDictation();
  }

  clearVaribles() {
    this.histories = [];
    this.dictation = null;
    this.dictationId = null;
    this.vocabPractices = [];
    this.questionIndex = 0;
    this.totalQuestions = 0;
    this.mark = 0;
    this.answer = '';
    this.puzzleControls = null;
  }

  async initDictation() {
    this.loading = await this.ionicComponentService.showLoading();
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.questionIndex = 0;
    this.totalQuestions = 0;
    this.mark = 0;
    this.phonics = 'Phonetic';
    this.dictationHelper.wordsToPractice(this.dictation)
      .pipe(
          mergeMap(word => {
            this.totalQuestions++;
            return this.vocabPracticeService.getQuestion(word, this.dictation.showImage);
          }),
          mergeMap(vocabPractice => this.dictation.showImage ? this.vocabPracticeService.getImages(vocabPractice, this.dictation.includeAIImage) : of(vocabPractice))
      ).subscribe(p => this.receiveVocabPractice(p));
  }

  get type() { return VocabPracticeType; }
  get practiceType() { return this.dictation?.options?.practiceType ?? VocabPracticeType.Spell; }

  receiveVocabPractice(p: VocabPractice) {
    void this.speechService.prefetchByVoiceMode(p.word, {
      speakPunctuation: this.dictation?.options?.speakPunctuation,
      pronounceUrl: p.activePronounceLink,
    });
    this.vocabPractices.push(p);
    if (this.vocabPractices.length === 1) {
      this.onNextQuestion();
    }
  }

  speak() {
    const word = this.currentQuestion().word;
    void this.speechService.speakByVoiceMode(word, {
      speakPunctuation: this.dictation?.options?.speakPunctuation,
      pronounceUrl: this.currentQuestion().activePronounceLink,
    });
    this.speak$.next(true);
  }

  showPhonics() {
    if (this.currentQuestion().ipaunavailable) {
      this.phonics = 'N.A.';
    } else {
      this.phonics = this.currentQuestion().ipa;
    }
  }

  currentQuestion() { return this.vocabPractices[this.questionIndex]; }

  submitSpellingAnswer() { this.submitAnswer(() => this.isSpellingCorrect()); }

  finishPuzzleQuestion() {
    this.submitAnswer(() => true);
  }

  submitAnswer(isCorrect: () => boolean) {
    this.checkAnswer(isCorrect);
    this.nextQuestion();
  }

  nextQuestion() {
    if (this.end()) {
      this.navigationService.practiceComplete({
        dictation : this.dictation, histories: this.histories, mark: this.mark
      });
      return;
    }

    this.waitForNextQuestion().then(() => this.onNextQuestion());
  }

  onNextQuestion() {
    this.loading.dismiss();
    this.preNextQuestion();
    this.speak();
    this.focusAnswerInput();
    if (this.practiceType === VocabPracticeType.Puzzle) {
      this.puzzleControls = this.vocabPracticeService.createPuzzleControls(this.currentQuestion().word);
    }
  }

  end = (): boolean => this.questionIndex + 1 >= this.totalQuestions;

  onKeyPress = (key: string) => this.answer += key;

  onCharacterButtonPress(character: string) {
    this.vocabPracticeService.receiveAnswer(this.puzzleControls, character);
    if (this.puzzleControls.isComplete()) {
      this.puzzleControls.answerState = 'correct';
      this.speak();
      setTimeout(() => this.finishPuzzleQuestion(), 3000);
    }
  }

  onKeyboardEvent(event: VirtualKeyboardEvent) {
    switch (event) {
      case VirtualKeyboardEvent.Backspace:
        this.backspace();
        break;
      case VirtualKeyboardEvent.Clear:
        this.answer = '';
        break;
      case VirtualKeyboardEvent.Close:
        this.isKeyboardActive = false;
        break;
      case VirtualKeyboardEvent.Open:
        this.isKeyboardActive = true;
        break;
    }
  }

  backspace() { this.answer = this.answer.slice(0, this.answer.length - 1); }
  isSpellingCorrect() { return this.vocabPracticeService.isWordEqual(this.currentQuestion().word, this.answer == null ? '' : this.answer, this.dictation.wordContainSpace); }

  private checkAnswer(isCorrect: () => boolean) {
    const correct = isCorrect();
    if (correct) { this.mark++; }

    const history = <VocabPracticeHistory>  {
      answer: this.answer,
      question: this.currentQuestion(),
      correct: correct,
      state: ''
    };
    this.histories.unshift(history);
    history.state = 'in';
  }

  private preNextQuestion() {
    this.phonics = 'Phonetic';
    this.answer = '';
  }

  async waitForNextQuestion() {
    const nextQuestionIndex = this.questionIndex + 1;
    const waitingNeeded = nextQuestionIndex >= this.vocabPractices.length && nextQuestionIndex < this.totalQuestions;
    if (waitingNeeded) {
      this.loading = await this.ionicComponentService.showLoading();

      for (let count = 0; count < 100 && nextQuestionIndex >= this.vocabPractices.length; count++) {
        this.log.debug('waiting for question api return');
        await this.sleep(500);
      }
    }
    this.questionIndex = nextQuestionIndex;
    this.loading.dismiss();
  }

  sleep(ms = 0) { return new Promise(r => setTimeout(r, ms)); }

  focusAnswerInput() {
    if (!this.isKeyboardActive && this.answerInput) {
      setTimeout(() => this.answerInput.setFocus(), 100);
    }
  }
}
