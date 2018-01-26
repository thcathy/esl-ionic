import {Component, Input} from '@angular/core';
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";

/**
 * Generated class for the PracticeHistoryListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'practice-history-list',
  templateUrl: 'practice-history-list.html'
})
export class PracticeHistoryListComponent {
  @Input() histories: VocabPracticeHistory[];
  @Input() mark: number;

  constructor() {
  }

}
