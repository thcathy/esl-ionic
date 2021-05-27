import {Component, OnInit} from '@angular/core';
import {Dictation, PuzzleControls} from '../../entity/dictation';
import {VocabPractice} from '../../entity/voacb-practice';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {DictationService} from '../../services/dictation/dictation.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {SpeechService} from '../../services/speech.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {Storage} from '@ionic/storage';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute} from '@angular/router';
import {NGXLogger} from 'ngx-logger';
import {VirtualKeyboardEvent} from '../../components/virtual-keyboard/virtual-keyboard';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';

@Component({
  selector: 'app-dictation-practice',
  templateUrl: './dictation-practice.page.html',
  styleUrls: ['./dictation-practice.page.scss'],
})
export class DictationPracticePage implements OnInit {

  dictation: Dictation;
  dictationId: number;
  vocabPractices: VocabPractice[] = [];
  questionIndex: number;
  phonics: string;
  answer: string;
  mark = 0;
  histories: VocabPracticeHistory[] = [];
  audio: Map<string, HTMLAudioElement> = new Map<string, HTMLAudioElement>();
  loading: any;
  isKeyboardActive: boolean;
  practiceType: VocabPracticeType;
  puzzleControls: PuzzleControls;

  constructor(
    public route: ActivatedRoute,
    public vocabPracticeService: VocabPracticeService,
    public dictationService: DictationService,
    public speechService: SpeechService,
    public navigationService: NavigationService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
    private log: NGXLogger,
  ) { }

  ngOnInit() {      }

  ionViewWillEnter() {
    this.clearVaribles();
    this.initDictation();
  }

  clearVaribles() {
    this.histories = [];
    this.dictation = null;
    this.dictationId = null;
    this.vocabPractices = [];
    this.questionIndex = 0;
    this.mark = 0;
    this.answer = '';
    this.puzzleControls = null;
  }

  async initDictation() {
    this.loading = await this.ionicComponentService.showLoading();
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.practiceType = await this.storage.get(NavigationService.storageKeys.vocabPracticeType);
    this.questionIndex = 0;
    this.mark = 0;
    this.phonics = 'Phonetic';
    this.dictation.vocabs
      .map((vocab) => this.vocabPracticeService.getQuestion(vocab.word, this.dictation.showImage))
      .map((o) => o.subscribe((p) => {
        this.gotPractice(p);
        if (this.vocabPractices.length === 1) {
          this.loading.dismiss();
          this.speak();
          if (this.practiceType === VocabPracticeType.Puzzle) {
            this.puzzleControls = this.vocabPracticeService.createPuzzleControls(p.word);
          }
        }
      }));
  }

  get type() { return VocabPracticeType; }

  gotPractice(p: VocabPractice) {
    if (p.activePronounceLink) { this.audio.set(p.word, new Audio(p.activePronounceLink)); }
    this.vocabPractices.push(p);
  }

  speak() {
    const word = this.currentQuestion().word;
    if (this.audio.get(word) != null) {
      this.audio.get(word).play();
      this.audio.set(word, new Audio(this.currentQuestion().activePronounceLink));
    } else {
      this.speechService.speak(word);
    }
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
    this.questionIndex++;
    if (this.end()) {
      this.navigationService.practiceComplete({
        dictation : this.dictation, histories: this.histories, practiceType: this.practiceType, mark: this.mark
      });
      return;
    }

    this.waitForNextQuestion().then(() => {
      this.preNextQuestion();
      this.speak();
      if (this.practiceType === VocabPracticeType.Puzzle) {
        this.puzzleControls = this.vocabPracticeService.createPuzzleControls(this.currentQuestion().word);
      }
    });
  }

  end = (): boolean => this.questionIndex >= this.vocabPractices.length;

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
    if (this.questionIndex >= this.vocabPractices.length && this.questionIndex < this.dictation.vocabs.length) {
      this.ionicComponentService.showLoading().then(l => this.loading = l);

      let count = 0;
      while (count < 100 && this.questionIndex >= this.vocabPractices.length) {
        this.log.debug(`waiting for question api return`);
        await this.sleep(500);
        count++;
      }

      this.loading.dismiss();
    }
  }

  sleep(ms = 0) { return new Promise(r => setTimeout(r, ms)); }
}
