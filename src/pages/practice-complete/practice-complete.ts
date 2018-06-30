import {Component, ViewChild} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import {NavigationService} from "../../providers/navigation.service";
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";
import {Dictation} from "../../entity/dictation";
import {DictationService} from "../../providers/dictation/dictation.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {TranslateService} from "@ngx-translate/core";

@IonicPage()
@Component({
  selector: 'page-practice-complete',
  templateUrl: 'practice-complete.html',
})
export class PracticeCompletePage {
  @ViewChild('dictationCard') dictationCard;

  dictation: Dictation;
  mark: number;
  histories: VocabPracticeHistory[] = [];
  recommended: boolean;
  finished: boolean = false;
  historyStored: boolean;
  loader;

  constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NavigationService,
        public dictationService: DictationService,
        public ga: GoogleAnalytics,
        public translate: TranslateService,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public toastCtrl: ToastController,
  ) {
    this.getNavParams();
    this.createHistory();
  }

  ionViewWillEnter() {
    this.ga.trackView('practice-complete')
  }

  getNavParams() {
    this.dictation = this.navParams.get('dictation');
    this.mark = this.navParams.get('mark');
    this.histories = this.navParams.get('histories');
    this.historyStored = this.navParams.get('historyStored');
  }

  createHistory() {
    if (this.dictationService.isInstantDictation(this.dictation) || this.historyStored) return;

    this.dictationService.createVocabDictationHistory(this.dictation, this.mark, this.histories)
      .subscribe(
        d => this.dictation = d,
        e => alert(e),
        () => this.finished = true
      );
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
