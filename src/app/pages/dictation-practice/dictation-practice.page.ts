import {Component, OnInit, ViewChild} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {VocabPractice} from '../../entity/voacb-practice';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {LoadingController} from '@ionic/angular';
import {DictationService} from '../../services/dictation/dictation.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {TranslateService} from '@ngx-translate/core';
import {SpeechService} from '../../services/speech.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {Storage} from '@ionic/storage';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute} from '@angular/router';
import {MemberVocabulary} from "../../entity/member-vocabulary";
import {NGXLogger} from 'ngx-logger';
import {UIOptionsService} from '../../services/ui-options.service';

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
  showKeyboard = true;
  @ViewChild('answerElement') answerInput;

  constructor(
    public route: ActivatedRoute,
    public loadingController: LoadingController,
    public vocabPracticeService: VocabPracticeService,
    public dictationService: DictationService,
    public translateService: TranslateService,
    public speechService: SpeechService,
    public navigationService: NavigationService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
    public uiOptionsService: UIOptionsService,
    private log: NGXLogger,
  ) { }

  ngOnInit() {
    this.uiOptionsService.loadOption(UIOptionsService.keys.disableKeyboard)
      .then(v => this.showKeyboard = !v);
  }

  ionViewDidEnter() {
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
  }

  async initDictation() {
    this.loading = await this.ionicComponentService.showLoading();
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.dictationId = await this.storage.get(NavigationService.storageKeys.dictationId);
    if (this.dictation == null && this.dictationId > 0) {
      this.dictation = await this.dictationService.getById(this.dictationId).toPromise();
    }

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
        }
      }));
  }

  gotPractice(p: VocabPractice) {
    this.vocabPractices.push(p);
    if (p.activePronounceLink) { this.audio.set(p.word, new Audio(p.activePronounceLink)); }
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

  currentQuestion() {
    return this.vocabPractices[this.questionIndex];
  }

  submitAnswer() {
    this.checkAnswer();
    this.questionIndex++;

    this.waitForNextQuestion().then(() => {
      if (this.end()) {
        this.navigationService.practiceComplete(this.dictation, this.mark, this.histories);
      } else {
        this.preNextQuestion();
        this.speak();
      }
    });
  }

  end(): boolean {
    return this.questionIndex >= this.vocabPractices.length;
  }

  onKeyPress(key: string) {
    this.answer += key;
  }

  onBackspace(any) {
    this.answer = this.answer.slice(0, this.answer.length - 1);
  }

  private checkAnswer() {
    const correct = this.vocabPracticeService.isWordEqual(this.currentQuestion().word, this.answer == null ? '' : this.answer);
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

  clickShowKeyboard() {
    this.showKeyboard = !this.showKeyboard;
    this.uiOptionsService.saveOption(UIOptionsService.keys.disableKeyboard, !this.showKeyboard);
  }

  sleep(ms = 0) { return new Promise(r => setTimeout(r, ms)); }
}
