import {Component, Input} from '@angular/core';
import {NavigationService} from "../../providers/navigation.service";
import {PracticeHistory} from "../../entity/practice-models";
import {ValidationUtils} from "../../utils/validation-utils";
import {NavController} from "ionic-angular";
import {DictationService} from "../../providers/dictation/dictation.service";
import {PracticeCompletePage} from "../../pages/practice-complete/practice-complete";

@Component({
  selector: 'member-practice-history-list',
  templateUrl: 'member-practice-history-list.html'
})
export class MemberPracticeHistoryListComponent {
  @Input() histories: PracticeHistory[];

  constructor(
    public navService: NavigationService,
    public navCtrl: NavController,
    public dictationService: DictationService,
  ) {}

  getDictationTitle(historyJSON: string) {
    if (ValidationUtils.isBlankString(historyJSON)) return '';

    const history = JSON.parse(historyJSON);
    return history.dictation.title;
  }

  openHistory(history: PracticeHistory) {
    const historyObj = JSON.parse(history.historyJSON);
    if (this.dictationService.isSentenceDictation(historyObj['dictation'])) {
      this.navCtrl.setRoot('ArticleDictationCompletePage', {
        'dictation': historyObj['dictation'],
        'histories': historyObj['histories'],
        'historyStored': true
      });
    } else {
      this.navCtrl.setRoot(PracticeCompletePage, {
        'dictation': historyObj['dictation'],
        'histories': historyObj['histories'],
        'mark': historyObj['mark'],
        'historyStored': true
      });
    }

  }

}
