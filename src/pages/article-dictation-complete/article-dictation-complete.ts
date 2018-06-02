import {Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {SentenceHistory} from "../../entity/sentence-history";
import {DictationService} from "../../providers/dictation/dictation.service";
import {NavigationService} from "../../providers/navigation.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {TranslateService} from "@ngx-translate/core";

@IonicPage()
@Component({
  selector: 'page-article-dictation-complete',
  templateUrl: 'article-dictation-complete.html',
})
export class ArticleDictationCompletePage {
  @ViewChild('dictationCard') dictationCard;

  dictation: Dictation;
  histories: SentenceHistory[];
  totalWrong: number;
  totalCorrect: number;
  recommended: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dictationService: DictationService,
    public navService: NavigationService,
    public ga: GoogleAnalytics,
    public translate: TranslateService
  ) {
    this.getNavParams();
    this.calculateCorrect(this.histories);
    if (!dictationService.isInstantDictation(this.dictation)) {
      dictationService.createHistory(this.dictation.id, this.totalCorrect / 10, []).subscribe(d => {
        this.dictation = d;
      });
    }
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

  recommend() {
    this.dictationService.recommend(this.dictation.id).subscribe(d => {
      this.dictation = d;
      this.recommended = true;
      this.dictationCard.highlightRecommend();
    })
  }

  recommendBtnText(): string {
    if (this.recommended)
      return this.translate.instant('Recommended');
    else
      return this.translate.instant('Recommend');
  }

}
