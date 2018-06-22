import {Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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

  constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NavigationService,
        public dictationService: DictationService,
        public ga: GoogleAnalytics,
        public translate: TranslateService,
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
  }

  createHistory() {
    if (this.dictationService.isInstantDictation(this.dictation)) return;

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

}
