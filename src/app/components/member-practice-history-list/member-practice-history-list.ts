import {Component, Input} from '@angular/core';
import {PracticeHistory} from '../../entity/practice-models';
import {ValidationUtils} from '../../utils/validation-utils';
import {NavigationService} from '../../services/navigation.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {Router} from '@angular/router';

@Component({
  selector: 'member-practice-history-list',
  templateUrl: 'member-practice-history-list.html',
  styleUrls: ['member-practice-history-list.scss'],
})
export class MemberPracticeHistoryListComponent {
  @Input() histories: PracticeHistory[];
  @Input() loading: boolean;

  constructor(
    public router: Router,
    public navService: NavigationService,
    public dictationService: DictationService,
  ) {}

  getDictationTitle(historyJSON: string) {
    if (ValidationUtils.isBlankString(historyJSON)) { return ''; }

    const history = JSON.parse(historyJSON);
    return history.dictation.title;
  }

  openHistory(history: PracticeHistory) {
    const historyObj = JSON.parse(history.historyJSON);
    if (this.dictationService.isSentenceDictation(historyObj['dictation'])) {
      this.navService.articleDictationComplete(historyObj['dictation'], historyObj['histories'], true);
    } else {
      this.navService.practiceComplete(historyObj['dictation'], historyObj['mark'], historyObj['histories'], true);
    }

  }

}
