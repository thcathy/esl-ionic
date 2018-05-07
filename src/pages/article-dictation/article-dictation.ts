import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {ArticleDictationService} from "../../providers/dictation/article-dictation.service";
import {AppService} from "../../providers/app.service";
import {TextToSpeech} from "@ionic-native/text-to-speech";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {SentenceHistory} from "../../entity/sentence-history";
import {ArticleDictationCompletePage} from "../article-dictation-complete/article-dictation-complete";

declare var responsiveVoice: any;

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

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public appService: AppService,
              public ga: GoogleAnalytics,
              public tts: TextToSpeech,
              public articleDictationService: ArticleDictationService) {
    this.dictation = navParams.get('dictation');
    this.sentences = articleDictationService.divideToSentences(this.dictation.article);
    console.log(`divided into ${this.sentences.length} sentences`);
  }

  ionViewDidLoad() {
    this.ga.trackView('article-dictation')
  }

  stop() {
    if (this.appService.isApp()) {
      this.tts.stop().then(() => console.log(`stopped tss`));
    } else {
      responsiveVoice.stop();
    }
  }

  slower() {
    if (this.speakingRate > 0) this.speakingRate -= 0.1;
  }

  faster() {
    if (this.speakingRate < 1.0) this.speakingRate += 0.1;
  }

  speak() {
    if (this.appService.isApp()) {
      this.tts.speak({
        text: this.sentences[this.currentSentence],
        locale: 'en-US',
        rate: this.speakingRate
      })
        .then(() => console.log('Success by tts'))
        .catch((reason: any) => console.log(reason));
    } else {
      console.log(`speak by responsive voice`);
      responsiveVoice.speak(this.sentences[this.currentSentence], "UK English Female", {rate: this.speakingRate});
    }
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
  }
}
