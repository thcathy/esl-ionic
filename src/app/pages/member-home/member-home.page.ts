import {Component, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {Dictation} from '../../entity/dictation';
import {MemberScore} from '../../entity/member-score';
import {PracticeHistory} from '../../entity/practice-models';
import {MemberDictationService} from '../../services/dictation/member-dictation.service';
import {PracticeHistoryService} from '../../services/dictation/practice-history.service';
import {RankingService} from '../../services/ranking/ranking.service';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute} from '@angular/router';
import {NGXLogger} from 'ngx-logger';
import 'rxjs-compat/add/operator/finally';
import {finalize} from 'rxjs/operators';
import {ModalController} from '@ionic/angular';
import {VocabSelectionComponent} from '../../components/vocab-selection/vocab-selection.component';
import {MemberVocabCardComponent} from '../../components/member-vocab-card/member-vocab-card.component';

@Component({
  selector: 'app-member-home',
  templateUrl: './member-home.page.html',
  styleUrls: ['./member-home.page.scss'],
})
export class MemberHomePage implements OnInit {
  createdDictations = [] as Dictation[];
  allTimesScore: MemberScore;
  latestScore = [] as MemberScore[];
  practiceHistories = [] as PracticeHistory[];
  selectedSegment: String;
  @ViewChild('ionSegment', { static: true }) ionSegment;
  loadingAllTimesAndLast6Score: boolean; loadingPracticeHistories: boolean;
  loadingCreatedDictations: boolean; loadingVocabHistory: boolean;

  constructor(
    public memberDictationService: MemberDictationService,
    public practiceHistoryService: PracticeHistoryService,
    public rankingService: RankingService,
    public manageVocabHistoryService: ManageVocabHistoryService,
    public route: ActivatedRoute,
    public navigationService: NavigationService,
    public location: Location,
    private log: NGXLogger,
    public modalController: ModalController,
  ) { }

  ngOnInit() {
    this.log.info(`${this.selectedSegment}`);
  }

  ionViewDidEnter() {
    this.log.info(`${this.selectedSegment}`);
    this.ionSegment.value = this.selectedSegment;
    this.route.params.subscribe(params => {
      if (params.segment) { this.selectedSegment = params.segment; }
      this.ionSegment.value = this.selectedSegment;
    });
    // this.createdDictations = [];
    // this.allTimesScore = null;
    // this.latestScore = [];
    // this.practiceHistories = [];
    this.init();
  }

  async init() {
    this.loadingAllTimesAndLast6Score = true;
    this.loadingPracticeHistories = true;
    this.loadingCreatedDictations = true;
    this.loadingVocabHistory = true;

    this.rankingService.allTimesAndLast6Score().pipe(
      finalize(() => this.loadingAllTimesAndLast6Score = false),
    ).subscribe(s => this.setScores(s));

    this.practiceHistoryService.getAll().pipe(
      finalize(() => this.loadingPracticeHistories = false),
    ).subscribe(s => this.practiceHistories = s);

    this.memberDictationService.getAllDictation().pipe(
      finalize(() => this.loadingCreatedDictations = false),
    ).subscribe(dictations => {
      this.createdDictations = dictations;
    });

    this.manageVocabHistoryService.loadFromServer()
      .finally(() => this.loadingVocabHistory = false);
  }

  get learntVocabs() { return this.manageVocabHistoryService.learntVocabs; }
  get answeredBeforeVocabs() { return this.manageVocabHistoryService.answeredBefore; }

  private setScores(scores: MemberScore[]) {
    this.log.info(`${scores.length} scores is returned`);
    this.allTimesScore = scores.find(s => s.scoreYearMonth > 999999);
    this.latestScore = scores.filter(s => s.scoreYearMonth < 999999)
      .sort( (a, b) => b.scoreYearMonth - a.scoreYearMonth);
  }

  segmentChanged(ev: any) {
    this.selectedSegment = ev.detail.value;
    this.location.go(`/member-home/${ev.detail.value}`);
  }

  onVocabHistoryList(value: string) {
    if (value === 'reviewAll') {
      this.navigationService.startDictation(
        this.manageVocabHistoryService.generatePracticeFromAnsweredBefore()
      );
    } else if (value === 'reviewSelected') {
      this.presentVocabSelectionModal();
    }
  }

  async presentVocabSelectionModal() {
    const modal = await this.modalController.create({
      component: VocabSelectionComponent,
      cssClass: 'vocab-selection-class',
      componentProps: {
        'inputVocab': Array.from(this.answeredBeforeVocabs.values()),
      }
    });
    await modal.present();
    modal.onDidDismiss().then(v => this.presentVocabCard(v.data));
  }

  presentVocabCard(data) {
    if (data !== undefined && data['dictation'] !== undefined) {
      this.modalController.create({
        component: MemberVocabCardComponent,
        componentProps: {
          'dictation': data['dictation'],
        }
      }).then(v => v.present());
    }
  }
}
