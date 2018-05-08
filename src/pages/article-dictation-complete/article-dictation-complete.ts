import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {SentenceHistory} from "../../entity/sentence-history";
import {DictationService} from "../../providers/dictation/dictation.service";
import {NavigationService} from "../../providers/navigation.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@IonicPage()
@Component({
  selector: 'page-article-dictation-complete',
  templateUrl: 'article-dictation-complete.html',
})
export class ArticleDictationCompletePage {
  dictation: Dictation;
  histories: SentenceHistory[];
  totalWrong: number;
  totalCorrect: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dictationService: DictationService,
    public navService: NavigationService,
    public ga: GoogleAnalytics,
  ) {
    this.getNavParams();
    this.calculateCorrect(this.histories);
  }

  ionViewDidLoad() {
    this.ga.trackView('article-dictation-complete');
  }

  getNavParams() {
    this.dictation = this.navParams.get('dictation');
    this.histories = this.navParams.get('histories');
  }

  private calculateCorrect(histories: SentenceHistory[]) {
    const sumAccumulator = (acc, val) => acc + val;
    const wrongs = (h) => h.isCorrect.filter((s)=>!s).length;
    const corrects = (h) => h.isCorrect.filter(Boolean).length;

    this.totalCorrect = histories.map(corrects).reduce(sumAccumulator);
    this.totalWrong = histories.map(wrongs).reduce(sumAccumulator);
  }

  retryDictation() {
    if (this.dictationService.isInstantDictation(this.dictation))
      this.navCtrl.setRoot('InstantDictationPage');
    else
      this.navService.startDictation(this.dictation);
  }


}
