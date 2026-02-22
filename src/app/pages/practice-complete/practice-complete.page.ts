import {Component, OnInit, ViewChild} from '@angular/core';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {Dictation, Dictations} from '../../entity/dictation';
import {NavigationService} from '../../services/navigation.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {TranslateService} from '@ngx-translate/core';
import {IonicComponentService} from '../../services/ionic-component.service';
import {FFSAuthService} from '../../services/auth.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {NGXLogger} from 'ngx-logger';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {DictationHelper} from '../../services/dictation/dictation-helper.service';
import {StorageService} from '../../services/storage.service';
import {DictationCardComponent} from '../../components/dictation-card/dictation-card';

@Component({
    selector: 'app-practice-complete',
    templateUrl: './practice-complete.page.html',
    styleUrls: ['./practice-complete.page.scss'],
    standalone: false
})
export class PracticeCompletePage implements OnInit {
  @ViewChild('dictationCard') dictationCard: DictationCardComponent;
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
    public dictationHelper: DictationHelper,
    public vocabPracticeService: VocabPracticeService,
    public translate: TranslateService,
    public translateService: TranslateService,
    public ionicComponentService: IonicComponentService,
    public storage: StorageService,
    public navigationService: NavigationService,
    public authService: FFSAuthService,
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

    if (this.dictationHelper.isGeneratedDictation(this.dictation) || this.dictationHelper.isSelectVocabExercise(this.dictation)) {
      this.vocabPracticeService.saveHistory(this.histories, this.dictation.id)
        .subscribe(results => {
          this.log.info(`update vocab history cache: size: ${results.length}`);
          this.manageVocabHistoryService.classifyVocabulary(results);
        });
      return;
    }

    if (this.dictationHelper.isInstantDictation(this.dictation)) {
      return;
    }

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
    });
  }

  showRecommendButton() {
    return this.dictation && !this.dictationHelper.isInstantDictation(this.dictation) && !this.historyStored && this.dictation.source === Dictations.Source.FillIn;
  }

  recommendBtnText(): string {
    return this.translate.instant(this.recommended ? 'Recommended' : 'Recommend');
  }

  retryWithOptions(retryWrongWord: boolean) {
    const selectedType = this.dictationCard?.getSelectedPracticeType() ?? this.practiceType;
    if (this.dictationHelper.isGeneratedDictation(this.dictation) || this.dictationHelper.isInstantDictation(this.dictation)) {
      const updatedDictation = this.dictationCard?.prepareStartDictation(this.dictation, selectedType) ?? this.dictation;
      this.openDictation(updatedDictation, selectedType, retryWrongWord);
      return;
    }

    this.dictationService.getById(this.dictation.id)
      .toPromise()
      .then(d => {
        const updatedDictation = this.dictationCard?.prepareStartDictation(d, selectedType) ?? d;
        this.openDictation(updatedDictation, selectedType, retryWrongWord);
      })
      .catch(e => this.showCannotGetDictation(e));
  }

  openDictation(d: Dictation, type: VocabPracticeType, retryWrongWord: boolean) {
    if (this.loader) { this.loader.dismiss(); }
    d.options = {
      ...(d.options || {}),
      practiceType : type,
      retryWrongWord: retryWrongWord,
      vocabPracticeHistories: retryWrongWord ? this.histories : [],
    };
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
      && (this.dictation.source === Dictations.Source.Select || this.dictation.source === Dictations.Source.Generate);
  }

  showRetryIncorrect() {
    return this.mark < this.histories.length &&
      (this.dictationHelper.isGeneratedDictation(this.dictation) || !this.dictationHelper.isInstantDictation(this.dictation));
  }

  get showDictationContent() { return this.dictation?.options?.retryWrongWord; }

}

export interface PracticeCompletePageInput {
  dictation: Dictation;
  histories: VocabPracticeHistory[];
  mark?: number;
  historyStored?: boolean;
}
