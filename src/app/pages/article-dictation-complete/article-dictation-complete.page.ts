import {Component, OnInit, ViewChild} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {SentenceHistory} from "../../entity/sentence-history";
import {DictationService} from "../../services/dictation/dictation.service";
import {NavigationService} from "../../services/navigation.service";
import {TranslateService} from "@ngx-translate/core";
import {Storage} from "@ionic/storage";
import {ActivatedRoute} from "@angular/router";
import {IonicComponentService} from "../../services/ionic-component.service";

@Component({
  selector: 'app-article-dictation-complete',
  templateUrl: './article-dictation-complete.page.html',
  styleUrls: ['./article-dictation-complete.page.scss'],
})
export class ArticleDictationCompletePage implements OnInit {
  @ViewChild('dictationCard') dictationCard;

  dictation: Dictation;
  histories: SentenceHistory[];
  totalWrong: number;
  totalCorrect: number;
  recommended: boolean;
  historyStored: boolean;
  loader;

  constructor(
    public route: ActivatedRoute,
    public dictationService: DictationService,
    public navService: NavigationService,
    public translate: TranslateService,
    public translateService: TranslateService,
    public ionicComponentService: IonicComponentService,
    public storage: Storage,
  ) { }

  ngOnInit() {
    this.init();
  }

  async init() {
    await this.getInputParameters();
    this.calculateCorrect(this.histories);
    if (!this.dictationService.isInstantDictation(this.dictation) && !this.historyStored) {
      this.dictationService.createSentenceDictationHistory(this.dictation, this.totalCorrect, this.totalWrong, this.histories)
        .subscribe(d => { this.dictation = d; });
    }
  }

  async getInputParameters() {
    this.dictation = await this.storage.get(NavigationService.storageKeys.dictation);
    this.histories = await this.storage.get(NavigationService.storageKeys.histories);
    this.historyStored = this.route.snapshot.queryParamMap.get('historyStored') === 'true';
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

  async getDictationThenOpen() {
    if (this.dictationService.isInstantDictation(this.dictation)) {
      this.openDictation(this.dictation);
    } else {
      this.loader = await this.ionicComponentService.showLoading();
      this.dictationService.getById(this.dictation.id)
        .subscribe(d => this.openDictation(d),  e => this.showCannotGetDictation(e))
    }
  }

  openDictation(d: Dictation) {
    if (this.loader) this.loader.dismiss();
    this.navService.retryDictation(d);
  }

  showCannotGetDictation(error) {
    console.warn(`Cannot get dictation: ${JSON.stringify(error)}`);
    if (this.loader) this.loader.dismiss();
    this.ionicComponentService.showToastMessage(this.translateService.instant('Dictation not found'), 'top');
  }

}
