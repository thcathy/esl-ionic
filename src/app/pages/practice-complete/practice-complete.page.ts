import {Component, OnInit, ViewChild} from '@angular/core';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {Dictation} from '../../entity/dictation';
import {NavigationService} from '../../services/navigation.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {TranslateService} from '@ngx-translate/core';
import {IonicComponentService} from '../../services/ionic-component.service';
import {Storage} from '@ionic/storage';
import {AuthService} from '../../services/auth.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {NGXLogger} from 'ngx-logger';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';

@Component({
  selector: 'app-practice-complete',
  templateUrl: './practice-complete.page.html',
  styleUrls: ['./practice-complete.page.scss'],
})
export class PracticeCompletePage implements OnInit {
  @ViewChild('dictationCard') dictationCard;
  dictation: Dictation;
  mark = 0;
  histories: VocabPracticeHistory[] = [];
  recommended: boolean;
  finished = false;
  historyStored: boolean;
  loader: any;
  practiceType: VocabPracticeType;

  constructor(
    public dictationService: DictationService,
    public vocabPracticeService: VocabPracticeService,
    public translate: TranslateService,
    public translateService: TranslateService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
    public navigationService: NavigationService,
    public authService: AuthService,
    public manageVocabHistoryService: ManageVocabHistoryService,
    private log: NGXLogger,
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.init();
  }

  async init() {
    await this.getNavParams();
    this.createHistory();
  }

  async getNavParams() {
    const input = <PracticeCompletePageInput> await this.storage.get(NavigationService.storageKeys.practiceCompletePageInput);
    this.dictation = input.dictation;
    this.histories = input.histories;
    this.mark = input.mark;
    this.practiceType = input.dictation?.options?.practiceType ?? VocabPracticeType.Spell;
    this.historyStored = input.historyStored ?? false;
  }

  createHistory() {
    if (this.historyStored || !this.authService.isAuthenticated() || this.practiceType === VocabPracticeType.Puzzle) {
      return;
    }

    if (this.dictationService.isGeneratedDictation(this.dictation) || this.dictationService.isSelectVocabExercise(this.dictation)) {
      this.vocabPracticeService.saveHistory(this.histories, this.dictation.id)
        .subscribe(results => {
          this.log.info(`update vocab history cache: size: ${results.length}`);
          this.manageVocabHistoryService.classifyVocabulary(results);
        });
      return;
    } else if (this.dictationService.isInstantDictation(this.dictation)) {
      return;
    } else {
      this.dictationService.createVocabDictationHistory(this.dictation, this.mark, this.histories)
        .subscribe(
          d => this.dictation = d,
          e => alert(e),
          () => this.finished = true
        );
      return;
    }
  }

  recommend() {
    this.dictationService.recommend(this.dictation.id).subscribe(d => {
      this.dictation = d;
      this.recommended = true;
      this.dictationCard.highlightRecommend();
    });
  }

  showRecommendButton() {
    return this.dictation && !this.historyStored && this.dictation.source === Dictation.Source.FillIn;
  }

  recommendBtnText(): string {
    if (this.recommended) {
      return this.translate.instant('Recommended');
    } else {
      return this.translate.instant('Recommend');
    }
  }

  getDictationThenOpen() {
    if (this.dictationService.isGeneratedDictation(this.dictation)) {
      this.navigationService.startDictation(this.dictation);
      return;
    } else if (this.dictationService.isInstantDictation(this.dictation)) {
      this.openDictation(this.dictation);
    } else {
      // this.ionicComponentService.showLoading().then(l => this.loader = l);
      this.ionicComponentService.presentVocabPracticeTypeActionSheet()
        .then(type => {
          this.dictationService.getById(this.dictation.id)
            .toPromise()
            .then(d => this.openDictation(d, type))
            .catch(e => this.showCannotGetDictation(e));
        });
    }
  }

  openDictation(d: Dictation, type: VocabPracticeType = VocabPracticeType.Spell) {
    if (this.loader) { this.loader.dismiss(); }
    d.options = { 'practiceType' : type };
    this.navigationService.retryDictation(d);
  }

  showCannotGetDictation(error) {
    console.warn(`Cannot get dictation: ${JSON.stringify(error)}`);
    if (this.loader) { this.loader.dismiss(); }
    this.ionicComponentService.showToastMessage(this.translateService.instant('Dictation not found'), 'top');
  }

  showOpenMyVocabulary() {
    return this.dictation
      && this.authService.isAuthenticated()
      && (this.dictation.source === Dictation.Source.Select || this.dictation.source === Dictation.Source.Generate);
  }

}

export interface PracticeCompletePageInput {
  dictation: Dictation;
  histories: VocabPracticeHistory[];
  mark?: number;
  historyStored?: boolean;
}
