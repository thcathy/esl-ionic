import {Component, ViewChild} from '@angular/core';
import {IonInput} from '@ionic/angular';
import {of, Subject} from 'rxjs';
import {mergeMap, tap} from 'rxjs/operators';
import {VirtualKeyboardEvent} from '../../components/virtual-keyboard/virtual-keyboard';
import {DictationPreloadComponent, PreloadCategoryName, PreloadResult} from '../../components/dictation-preload/dictation-preload.component';
import {Dictation, PuzzleControls} from '../../entity/dictation';
import {VocabPractice} from '../../entity/voacb-practice';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {UIOptionsService} from '../../services/ui-options.service';
import {DictationHelper} from '../../services/dictation/dictation-helper.service';
import {NavigationService} from '../../services/navigation.service';
import {InterpretationService} from '../../services/practice/interpretation.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {SpeechService} from '../../services/speech.service';
import {StorageService} from '../../services/storage.service';
@Component({
    selector: 'app-dictation-practice',
    templateUrl: './dictation-practice.page.html',
    styleUrls: ['./dictation-practice.page.scss'],
    standalone: false
})
export class DictationPracticePage {
  @ViewChild('answerInput') answerInput: IonInput;
  @ViewChild('preload', { static: true }) preload: DictationPreloadComponent;

  dictation: Dictation;
  showPreload = true;
  vocabPractices: VocabPractice[] = [];
  questionIndex: number;
  phonics: string;
  answer: string;
  mark = 0;
  histories: VocabPracticeHistory[] = [];
  isKeyboardActive: boolean;
  puzzleControls: PuzzleControls;
  speak$ = new Subject<boolean>();

  constructor(
    public vocabPracticeService: VocabPracticeService,
    public speechService: SpeechService,
    public navigationService: NavigationService,
    public storage: StorageService,
    public dictationHelper: DictationHelper,
    private interpretationService: InterpretationService,
  ) { }

  ionViewWillEnter() {
    this.clearVariables();
    this.initDictation();
  }

  clearVariables() {
    this.histories = [];
    this.dictation = null;
    this.vocabPractices = [];
    this.questionIndex = 0;
    this.mark = 0;
    this.answer = '';
    this.puzzleControls = null;
    this.showPreload = true;
  }

  async initDictation() {
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.questionIndex = 0;
    this.mark = 0;
    this.phonics = 'Phonetic';

    const words = this.dictationHelper.wordsToPractice(this.dictation);
    const voiceMode = await this.speechService.getVoiceMode();
    const isOnline = voiceMode === UIOptionsService.voiceMode.online;

    this.preload.start({
      questions: words.length,
      voices: isOnline ? words.length : 0,
      images: this.dictation.showImage ? words.length : 0,
      interpretations: words.length,
    });

    for (const word of words) {
      this.fetchQuestion(word)
        .pipe(
          mergeMap(vp => this.fetchImages(vp)),
          tap(vp => this.prefetchVoice(vp, isOnline)),
          tap(vp => this.interpretationService.interpret(vp.word)
            .subscribe(() => this.preload.recordInterpretation(true)))
        )
        .subscribe(p => this.receiveVocabPractice(p));
    }
  }

  get type() { return VocabPracticeType; }
  get practiceType() { return this.dictation?.options?.practiceType ?? VocabPracticeType.Spell; }

  onPreloadCompleted(_result: PreloadResult) {
    this.showPreload = false;
    this.onNextQuestion();
  }

  private fetchQuestion(word: string) {
    return this.vocabPracticeService.getQuestion(word, this.dictation.showImage).pipe(
      tap(vp => this.preload.recordQuestion(!!vp))
    );
  }

  private prefetchVoice(vp: VocabPractice, isOnline: boolean): void {
    if (!isOnline) { return; }
    this.speechService.prefetchByVoiceMode(vp.word, {
      speakPunctuation: this.dictation?.options?.speakPunctuation,
      pronounceUrl: vp.activePronounceLink,
    }).then(success => this.preload.recordVoice(success));
  }

  private fetchImages(vocabPractice: VocabPractice) {
    return this.dictation.showImage
      ? this.vocabPracticeService.getImages(vocabPractice, this.dictation.includeAIImage).pipe(
          tap(vp => this.preload.recordImage(!!vp?.picsFullPaths))
        )
      : of(vocabPractice);
  }

  private receiveVocabPractice(p: VocabPractice) {
    this.vocabPractices.push(p);
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
    this.questionIndex++;
    this.onNextQuestion();
  }

  onNextQuestion() {
    this.preNextQuestion();
    this.speak();
    this.focusAnswerInput();
    if (this.practiceType === VocabPracticeType.Puzzle) {
      this.puzzleControls = this.vocabPracticeService.createPuzzleControls(this.currentQuestion().word);
    }
  }

  end = (): boolean => this.questionIndex + 1 >= this.vocabPractices.length;

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
  isSpellingCorrect() { return this.vocabPracticeService.isWordEqual(this.currentQuestion().word, this.answer ?? '', this.dictation.wordContainSpace); }

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

  focusAnswerInput() {
    if (!this.showPreload && !this.isKeyboardActive && this.answerInput) {
      setTimeout(() => this.answerInput.setFocus(), 100);
    }
  }
}
