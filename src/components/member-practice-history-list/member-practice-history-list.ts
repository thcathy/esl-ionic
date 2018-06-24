import {Component, Input} from '@angular/core';
import {NavigationService} from "../../providers/navigation.service";
import {PracticeHistory} from "../../entity/practice-models";
import {ValidationUtils} from "../../utils/validation-utils";
import {DictationService} from "../../providers/dictation/dictation.service";
import {LoadingController, ToastController} from "ionic-angular";
import Any = jasmine.Any;
import {TranslateService} from "@ngx-translate/core";
import {Dictation} from "../../entity/dictation";

@Component({
  selector: 'member-practice-history-list',
  templateUrl: 'member-practice-history-list.html'
})
export class MemberPracticeHistoryListComponent {
  @Input() histories: PracticeHistory[];
  loader;

  constructor(
    public navService: NavigationService,
    public dictationSerivce: DictationService,
    public loadingCtrl: LoadingController,
    public translateService: TranslateService,
    public toastCtrl: ToastController,
  ) {}

  getDictationTitle(historyJSON: string) {
    if (ValidationUtils.isBlankString(historyJSON)) return '';

    const history = JSON.parse(historyJSON);
    return history.dictation.title;
  }

  openHistory(history: PracticeHistory) {
    this.loader = this.loadingCtrl.create({ content: this.translateService.instant('Please wait') + "..." })
    this.loader.present();
    this.dictationSerivce.getById(history.dictationId)
      .subscribe(d => this.openDictation(d),  e => this.showCannotGetDictation(e))
  }

  openDictation(d: Dictation) {
    this.loader.dismissAll();
    this.navService.openDictation(d);
  }

  showCannotGetDictation(error) {
    console.warn(`Cannot get dictation: ${JSON.stringify(error)}`);
    this.loader.dismissAll();
    let toast = this.toastCtrl.create({
      message: this.translateService.instant('Dictation not found'),
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
