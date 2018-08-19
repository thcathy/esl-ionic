import {Component, Input} from '@angular/core';
import {PracticeHistory} from "../../entity/practice-models";
import {ValidationUtils} from "../../utils/validation-utils";
import {NavigationService} from "../../services/navigation.service";
import {DictationService} from "../../services/dictation/dictation.service";
import {Router} from "@angular/router";

@Component({
  selector: 'member-practice-history-list',
  templateUrl: 'member-practice-history-list.html'
})
export class MemberPracticeHistoryListComponent {
  @Input() histories: PracticeHistory[];

  constructor(
    public router: Router,
    public navService: NavigationService,
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
      this.router.navigate(['/article-dictation-complete'], {
        queryParams: {
          dictation: historyObj['dictation'],
          histories: historyObj['histories'],
          historyStored: true,
        }});
    } else {
      this.router.navigate(['/practice-complete-page'], {
        queryParams: {
          dictation: historyObj['dictation'],
          histories: historyObj['histories'],
          mark: historyObj['mark'],
          historyStored: true,
        }});
    }

  }

}
