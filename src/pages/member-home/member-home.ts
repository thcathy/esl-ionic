import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {MemberDictationService} from "../../providers/dictation/member-dictation.service";
import {Dictation} from "../../entity/dictation";
import {TranslateService} from "@ngx-translate/core";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {MemberScore} from "../../entity/member-score";
import {RankingService} from "../../providers/ranking/ranking.service";
import {PracticeHistory} from "../../entity/practice-models";
import {PracticeHistoryService} from "../../providers/dictation/practice-history.service";

@IonicPage()
@Component({
  selector: 'page-member-home',
  templateUrl: 'member-home.html',
})
export class MemberHomePage {
  createdDictations: Array<Dictation>;
  allTimesScore: MemberScore;
  latestScore: MemberScore[];
  practiceHistories: PracticeHistory[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public memberDictationService: MemberDictationService,
    public translateService: TranslateService,
    public practiceHistoryService: PracticeHistoryService,
    public rankingService: RankingService,
    public ga: GoogleAnalytics,
  ) {
    let loader = this.loadingCtrl.create({ content: translateService.instant('Please wait') + "..." });
    loader.present();

    rankingService.allTimesAndLast6Score().subscribe((s) => this.setScores(s));

    practiceHistoryService.getAll().subscribe((s) => this.practiceHistories = s);

    memberDictationService.getAllDictation().subscribe(dictations => {
      loader.dismissAll();
      this.createdDictations = dictations;
    });
  }

  private setScores(scores: MemberScore[]) {
    console.log(`${scores.length} scores is returned`);
    this.allTimesScore = scores.find(s => s.scoreYearMonth > 999999);
    this.latestScore = scores.filter(s => s.scoreYearMonth < 999999)
                              .sort( (a,b) => a.scoreYearMonth - b.scoreYearMonth);
  }

  ionViewWillEnter() {
    this.ga.trackView('member-home')
  }

}
