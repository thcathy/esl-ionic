import {Component, Input} from '@angular/core';
import {VocabPracticeHistory} from "../../interfaces/vocab-practice-history";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'practice-history-list',
  templateUrl: 'practice-history-list.html',
  animations: [
    trigger('flyIn', [
      state('in', style({backgroundColor: '#ffffff'})),
      transition('* => in', [
        animate('750ms ease-out', style({backgroundColor: '#ffff33'})),
        animate('750ms ease-in', style({backgroundColor: '#ffffff'}))
      ])
    ])
  ]
})
export class PracticeHistoryListComponent {
  @Input() histories: VocabPracticeHistory[];
  @Input() mark: number;

  constructor() {
  }
}
