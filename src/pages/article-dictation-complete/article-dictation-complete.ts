import {Component, ViewChild} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import {Dictation} from "../../entity/dictation";
import {SentenceHistory} from "../../entity/sentence-history";
import {DictationService} from "../../providers/dictation/dictation.service";
import {NavigationService} from "../../providers/navigation.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {TranslateService} from "@ngx-translate/core";
import {PracticeHistory} from "../../entity/practice-models";

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
  historyStored: boolean;
  loader;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dictationService: DictationService,
    public navService: NavigationService,
    public ga: GoogleAnalytics,
    public translate: TranslateService,
    public loadingCtrl: LoadingController,
    public translateService: TranslateService,
    public toastCtrl: ToastController,
  ) {
    this.getNavParams();
    this.calculateCorrect(this.histories);
    if (!dictationService.isInstantDictation(this.dictation) && !this.historyStored) {
      dictationService.createSentenceDictationHistory(this.dictation, this.totalCorrect, this.totalWrong, this.histories)
        .subscribe(d => { this.dictation = d; });
    }
  }

  ionViewDidLoad() {
    this.ga.trackView('article-dictation-complete');
  }

  getNavParams() {
    this.dictation = this.navParams.get('dictation');
    this.histories = this.navParams.get('histories');
    this.historyStored = this.navParams.get('historyStored');
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

  getDictationThenOpen() {
    if (this.dictationService.isInstantDictation(this.dictation)) {
      this.openDictation(this.dictation);
    } else {
      this.loader = this.loadingCtrl.create({ content: this.translateService.instant('Please wait') + "..." })
      this.loader.present();
      this.dictationService.getById(this.dictation.id)
        .subscribe(d => this.openDictation(d),  e => this.showCannotGetDictation(e))
    }
  }

  openDictation(d: Dictation) {
    if (this.loader) this.loader.dismissAll();
    this.navService.retryDictation(d);
  }

  showCannotGetDictation(error) {
    console.warn(`Cannot get dictation: ${JSON.stringify(error)}`);
    this.loader.dismissAll();
    let toast = this.toastCtrl.create({
      message: this.translateService.instant('Dictation not found'),
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
