import {Component, OnInit, ViewChild} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {VocabPractice} from "../../entity/voacb-practice";
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";
import {LoadingController} from "@ionic/angular";
import {DictationService} from "../../services/dictation/dictation.service";
import {VocabPracticeService} from "../../services/practice/vocab-practice.service";
import {TranslateService} from "@ngx-translate/core";
import {SpeechService} from "../../services/speech.service";
import {IonicComponentService} from "../../services/ionic-component.service";
import {Storage} from "@ionic/storage";
import {NavigationService} from "../../services/navigation.service";
import {AfterViewInit} from "@angular/core/src/metadata/lifecycle_hooks";

@Component({
  selector: 'app-dictation-practice',
  templateUrl: './dictation-practice.page.html',
  styleUrls: ['./dictation-practice.page.scss'],
})
export class DictationPracticePage implements OnInit, AfterViewInit {

  dictation: Dictation;
  dictationId: number;
  vocabPractices: VocabPractice[] = [];
  questionIndex: number;
  phonics: string;
  answer: string;
  mark: number;
  histories: VocabPracticeHistory[] = [];
  loading: any;
  @ViewChild('answerElement') answerInput;

  constructor(
    public loadingController: LoadingController,
    public vocabPracticeService: VocabPracticeService,
    public dictationService: DictationService,
    public translateService: TranslateService,
    public speechService: SpeechService,
    public navigationService: NavigationService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
  ) { }

  ngOnInit() {
    this.initDictation();
  }

  ngAfterViewInit() {
    // trigger audio for this page
    var audio = new Audio('');
    audio.play();
  }

  async initDictation() {
    this.loading = await this.ionicComponentService.showLoading();
    this.dictation = await this.storage.get(NavigationService.storageKeys.DictationPracticePage_dictation);
    this.dictationId = await this.storage.get(NavigationService.storageKeys.DictationPracticePage_dictationId);
    if (this.dictation == null && this.dictationId > 0)
      this.dictationService.getById(this.dictationId)
        .toPromise().then(d => this.dictation = d);

    this.questionIndex = 0;
    this.mark = 0;
    this.phonics = "Phonetic";
    this.dictation.vocabs.forEach((vocab) => {
      this.vocabPracticeService.getQuestion(vocab.word, this.dictation.showImage)
        .subscribe((p) => {
          this.vocabPractices.push(p);

          if (this.vocabPractices.length == 1) {
            this.loading.dismiss();
            this.speak();
          }
        })
    });
  }

  speak() {
    if (this.vocabPractices[this.questionIndex].activePronounceLink) {
      var audio = new Audio(this.vocabPractices[this.questionIndex].activePronounceLink);
      audio.play();
    } else {
      this.speechService.speak(this.vocabPractices[this.questionIndex].word);
    }
    this.focusAnswer();
  }

  focusAnswer() {
    if (this.answerInput) {
      this.answerInput.nativeElement.shadowRoot.querySelector('input').focus();
    }
  }

  showPhonics() {
    if (this.currentQuestion().ipaunavailable) {
      this.phonics = "N.A.";
    } else {
      this.phonics = this.currentQuestion().ipa;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DictationPracticePage');
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

  private checkAnswer() {
    let correct = this.vocabPracticeService.isWordEqual(this.currentQuestion().word, this.answer == null ? '' : this.answer);
    if (correct) this.mark++;

    let history = <VocabPracticeHistory>  {
      answer: this.answer,
      question: this.currentQuestion(),
      correct: correct,
      state: ''
    }
    this.histories.unshift(history);
    history.state = 'in';
  }

  private preNextQuestion() {
    this.phonics = "Phonetic";
    this.answer = '';
  }

  async waitForNextQuestion() {
    if (this.questionIndex >= this.vocabPractices.length && this.questionIndex < this.dictation.vocabs.length) {
      this.ionicComponentService.showLoading();

      while (this.questionIndex >= this.vocabPractices.length) {
        console.log(`waiting for question api return`);
        await this.sleep(100);
      }

      this.loading.dismiss();
    }
  }

  sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
  }

}
