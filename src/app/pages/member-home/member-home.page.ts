import { Component, OnInit } from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {MemberScore} from "../../entity/member-score";
import {PracticeHistory} from "../../entity/practice-models";
import {LoadingController} from "@ionic/angular";
import {MemberDictationService} from "../../services/dictation/member-dictation.service";
import {TranslateService} from "@ngx-translate/core";
import {PracticeHistoryService} from "../../services/dictation/practice-history.service";
import {RankingService} from "../../services/ranking/ranking.service";
import {IonicComponentService} from "../../services/ionic-component.service";

@Component({
  selector: 'app-member-home',
  templateUrl: './member-home.page.html',
  styleUrls: ['./member-home.page.scss'],
})
export class MemberHomePage implements OnInit {
  createdDictations: Dictation[];
  allTimesScore: MemberScore;
  latestScore: MemberScore[];
  practiceHistories: PracticeHistory[];

  constructor(
    public loadingCtrl: LoadingController,
    public memberDictationService: MemberDictationService,
    public translateService: TranslateService,
    public practiceHistoryService: PracticeHistoryService,
    public rankingService: RankingService,
    public ionicComponentService: IonicComponentService,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.init();
  }

  async init() {
    let loader = await this.ionicComponentService.showLoading();
    this.rankingService.allTimesAndLast6Score().subscribe((s) => this.setScores(s));
    this.practiceHistoryService.getAll().subscribe((s) => this.practiceHistories = s);
    this.memberDictationService.getAllDictation().subscribe(dictations => {
      loader.dismiss();
      this.createdDictations = dictations;
    });
  }

  private setScores(scores: MemberScore[]) {
    console.log(`${scores.length} scores is returned`);
    this.allTimesScore = scores.find(s => s.scoreYearMonth > 999999);
    this.latestScore = scores.filter(s => s.scoreYearMonth < 999999)
      .sort( (a,b) => a.scoreYearMonth - b.scoreYearMonth);
  }

}
