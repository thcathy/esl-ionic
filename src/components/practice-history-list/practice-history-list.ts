import {Component, Input} from '@angular/core';
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

/**
 * Generated class for the PracticeHistoryListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'practice-history-list',
  templateUrl: 'practice-history-list.html',
  animations: [
    trigger('flyIn', [
      state('in', style({backgroundColor: '#ffffff'})),
      transition('* => in',
        animate(3000, style({backgroundColor: '#333333'}))
      )
    ])
  ]
})
export class PracticeHistoryListComponent {
  @Input() histories: VocabPracticeHistory[];
  @Input() mark: number;

  constructor() {
  }
}
