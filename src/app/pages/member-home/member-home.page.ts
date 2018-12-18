import { Component, OnInit } from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {MemberScore} from "../../entity/member-score";
import {PracticeHistory} from "../../entity/practice-models";
import {MemberDictationService} from "../../services/dictation/member-dictation.service";
import {PracticeHistoryService} from "../../services/dictation/practice-history.service";
import {RankingService} from "../../services/ranking/ranking.service";
import {ManageVocabHistoryService} from "../../services/member/manage-vocab-history.service";
import {MemberVocabulary} from "../../entity/member-vocabulary";

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
  selectedSegment: String;
  learntVocabularies: Map<string, MemberVocabulary> = new Map<string, MemberVocabulary>();
  alwaysWrongVocabularies: Map<string, MemberVocabulary> = new Map<string, MemberVocabulary>();

  constructor(
    public memberDictationService: MemberDictationService,
    public practiceHistoryService: PracticeHistoryService,
    public rankingService: RankingService,
    public manageVocabHistoryService: ManageVocabHistoryService,
  ) { }

  ngOnInit() {
    this.selectedSegment = 'dictation';
    this.manageVocabHistoryService.loadFromServer().then(_p => {
      this.learntVocabularies = this.manageVocabHistoryService.learntVocabularies;
      this.alwaysWrongVocabularies = this.manageVocabHistoryService.alwaysWrongVocabularies;
    });
  }

  ionViewDidEnter() {
    this.createdDictations = [];
    this.allTimesScore = null;
    this.latestScore = [];
    this.practiceHistories = [];
    this.init();
  }

  init() {
    this.rankingService.allTimesAndLast6Score().subscribe(s => this.setScores(s));
    this.practiceHistoryService.getAll().subscribe(s => this.practiceHistories = s);
    this.memberDictationService.getAllDictation().subscribe(dictations => {
      this.createdDictations = dictations;
    });
  }

  private setScores(scores: MemberScore[]) {
    console.log(`${scores.length} scores is returned`);
    this.allTimesScore = scores.find(s => s.scoreYearMonth > 999999);
    this.latestScore = scores.filter(s => s.scoreYearMonth < 999999)
      .sort( (a,b) => a.scoreYearMonth - b.scoreYearMonth);
  }

  segmentChanged(ev: any) {
    this.selectedSegment = ev.detail.value;
  }

}
