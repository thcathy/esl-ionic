import {Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {ArticleDictationService} from "../../providers/dictation/article-dictation.service";
import {AppService} from "../../providers/app.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {SentenceHistory} from "../../entity/sentence-history";
import {ArticleDictationCompletePage} from "../article-dictation-complete/article-dictation-complete";
import {SpeechService} from "../../providers/speech.service";

@IonicPage()
@Component({
  selector: 'page-article-dictation',
  templateUrl: 'article-dictation.html',
})
export class ArticleDictationPage {
  dictation: Dictation;
  sentences: string[];
  speakingRate: number = 0.7;
  currentSentence: number = 0;
  mark: number = 0;
  answer: string = "";
  histories: SentenceHistory[] = [];
  @ViewChild('answerElement') answerInput;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public appService: AppService,
              public ga: GoogleAnalytics,
              public articleDictationService: ArticleDictationService,
              public speechService: SpeechService,
  ) {
    this.dictation = navParams.get('dictation');
    this.sentences = articleDictationService.divideToSentences(this.dictation.article);
    console.log(`divided into ${this.sentences.length} sentences`);
    this.speak();
  }

  ionViewDidLoad() {
    this.ga.trackView('article-dictation')
  }

  slower() {
    this.speakingRate = this.speakingRate - 0.1;
    if (this.speakingRate < 0.01) this.speakingRate = 0.1;
  }

  faster() {
    this.speakingRate = this.speakingRate + 0.1;
    if (this.speakingRate > 0.99) this.speakingRate = 1.0;
  }

  speak() {
    this.speechService.speak(this.sentences[this.currentSentence], this.speakingRate);
    this.focusAnswer();
  }

  submitAnswer() {
    this.histories.unshift(
      this.articleDictationService.checkAnswer(this.sentences[this.currentSentence], this.answer)
    );

    this.currentSentence++;
    this.answer = "";

    if (this.currentSentence >= this.sentences.length) {
      this.navCtrl.setRoot(ArticleDictationCompletePage, {
        'dictation': this.dictation,
        'histories': this.histories.reverse()
      });
    }

    this.speak();
  }

  focusAnswer() {
    if (this.answerInput) this.answerInput.setFocus();
  }
}
