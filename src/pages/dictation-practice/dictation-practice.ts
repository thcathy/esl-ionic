import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {VocabPracticeService} from "../../providers/practice/vocab-practice.service";
import {VocabPractice} from "../../entity/voacb-practice";
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";
import {DictationService} from "../../providers/dictation/dictation.service";
import {PracticeCompletePage} from "../practice-complete/practice-complete";
import {TranslateService} from "@ngx-translate/core";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {TextToSpeech} from "@ionic-native/text-to-speech";
import {AppService} from "../../providers/app.service";

declare var responsiveVoice: any;

@IonicPage({
  segment: 'dictation-practice/:dictationId', // will be used in browser as URL
})
@Component({
  selector: 'page-dictation-practice',
  templateUrl: 'dictation-practice.html',
})
export class DictationPracticePage {
  dictation: Dictation;
  dictationId: number;
  vocabPractices: VocabPractice[] = [];
  questionIndex: number;
  phonics: string;
  answer: string;
  mark: number;
  histories: VocabPracticeHistory[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public vocabPracticeService: VocabPracticeService,
    public dictationService: DictationService,
    public translateService: TranslateService,
    public ga: GoogleAnalytics,
    public tts: TextToSpeech,
    public appService: AppService,
  ) {
    let loader = this.loadingCtrl.create({ content: translateService.instant('Please wait') + "..." });
    loader.present();

    this.dictation = navParams.get('dictation');
    this.dictationId = navParams.data.dictationId;
    this.init();

    this.dictation.vocabs.forEach((vocab) => {
      vocabPracticeService.getQuestion(vocab.word, this.dictation.showImage)
        .subscribe((p) => {
          this.vocabPractices.push(p);

          if (this.vocabPractices.length == 1) {
            loader.dismissAll();
            this.speak();
          }
        })
    });
  }

  private init() {
    if (this.dictation == null && this.dictationId > 0)
      this.dictationService.getById(this.dictationId)
        .toPromise().then(d => this.dictation = d);

    this.questionIndex = 0;
    this.mark = 0;
    this.phonics = "Phonetic";
  }

  ionViewWillEnter() {
    this.ga.trackView('dictation-practice')
  }

  speak() {
    if (this.vocabPractices[this.questionIndex].activePronounceLink) {
      var audio = new Audio(this.vocabPractices[this.questionIndex].activePronounceLink);
      audio.play();
    } else {
      if (this.appService.isApp()) {
        this.tts.speak(this.vocabPractices[this.questionIndex].word)
          .then(() => console.log('Success by tts'))
          .catch((reason: any) => console.log(reason));
      } else {
        console.log(`speak by responsive voice`);
        responsiveVoice.speak(this.vocabPractices[this.questionIndex].word);
      }
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
        this.navCtrl.setRoot(PracticeCompletePage, {
          'dictation': this.dictation,
          'mark': this.mark,
          'histories': this.histories
        });
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
      let loader = this.loadingCtrl.create({ content: this.translateService.instant('Please wait') + "..." });
      loader.present();

      while (this.questionIndex >= this.vocabPractices.length) {
        console.log(`waiting for question api return`);
        await this.sleep(100);
      }

      loader.dismissAll();
    }
  }

  sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
  }
}
