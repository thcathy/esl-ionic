import {Component, OnInit, ViewChild} from '@angular/core';
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";
import {Dictation} from "../../entity/dictation";
import {NavigationService} from "../../services/navigation.service";
import {DictationService} from "../../services/dictation/dictation.service";
import {TranslateService} from "@ngx-translate/core";
import {LoadingController, ToastController} from "@ionic/angular";
import {IonicComponentService} from "../../services/ionic-component.service";

@Component({
  selector: 'app-practice-complete',
  templateUrl: './practice-complete.page.html',
  styleUrls: ['./practice-complete.page.scss'],
})
export class PracticeCompletePage implements OnInit {
  @ViewChild('dictationCard') dictationCard;
  dictation: Dictation;
  mark: number;
  histories: VocabPracticeHistory[] = [];
  recommended: boolean;
  finished: boolean = false;
  historyStored: boolean;
  loader: any;

  constructor(
    public navService: NavigationService,
    public dictationService: DictationService,
    public translate: TranslateService,
    public translateService: TranslateService,
    public toastController: ToastController,
    public ionicComponentService: IonicComponentService,
  ) { }

  ngOnInit() {
    this.getNavParams();
    this.createHistory();
  }

  getNavParams() {
    this.dictation = this.storage.get(NavigationService.storageKeys.DictationPracticePage_dictation);
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
      this.loader = this.ionicComponentService.showLoading();
      this.dictationService.getById(this.dictation.id)
        .subscribe(d => this.openDictation(d),  e => this.showCannotGetDictation(e))
    }
  }

  openDictation(d: Dictation) {
    if (this.loader) this.loader.dismissAll();
    this.navService.retryDictation(d);
  }

  async showCannotGetDictation(error) {
    console.warn(`Cannot get dictation: ${JSON.stringify(error)}`);
    this.loader.dismissAll();
    const toast = await this.toastController.create({
      message: this.translateService.instant('Dictation not found'),
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
