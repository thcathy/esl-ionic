import {Component, OnInit, ViewChild} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {MemberScore} from "../../entity/member-score";
import {PracticeHistory} from "../../entity/practice-models";
import {MemberDictationService} from "../../services/dictation/member-dictation.service";
import {PracticeHistoryService} from "../../services/dictation/practice-history.service";
import {RankingService} from "../../services/ranking/ranking.service";
import {ManageVocabHistoryService} from "../../services/member/manage-vocab-history.service";
import {MemberVocabulary} from "../../entity/member-vocabulary";
import {NavigationService} from "../../services/navigation.service";
import {ActivatedRoute} from "@angular/router";

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
  learntVocabs: Map<string, MemberVocabulary> = new Map<string, MemberVocabulary>();
  frequentlyWrongVocabs: Map<string, MemberVocabulary> = new Map<string, MemberVocabulary>();
  @ViewChild('ionSegment') ionSegment;

  constructor(
    public memberDictationService: MemberDictationService,
    public practiceHistoryService: PracticeHistoryService,
    public rankingService: RankingService,
    public manageVocabHistoryService: ManageVocabHistoryService,
    public route: ActivatedRoute,
    public navigationService: NavigationService,
  ) { }

  ngOnInit() {
    this.manageVocabHistoryService.loadFromServer().then(_p => {
      this.learntVocabs = this.manageVocabHistoryService.learntVocabs;
      this.frequentlyWrongVocabs = this.manageVocabHistoryService.frequentlyWrongVocabs;
    });
  }

  ionViewDidEnter() {
    console.log(`ionViewDidEnter`);
    this.route.params.subscribe(params => {
      if (params.segment) this.selectedSegment = params.segment;
      this.ionSegment.value = this.selectedSegment;
    });
    this.createdDictations = [];
    this.allTimesScore = null;
    this.latestScore = [];
    this.practiceHistories = [];
    this.init();
  }

  async init() {
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
    this.navigationService.openMemberHome(ev.detail.value);
  }

}
