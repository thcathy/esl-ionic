import {Component, Input} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";

@Component({
    selector: 'practice-history-list',
    templateUrl: 'practice-history-list.html',
    styleUrls: ['practice-history-list.scss'],
    animations: [
        trigger('flyIn', [
            state('in', style({ backgroundColor: '#ffffff' })),
            transition('* => in', [
                animate('750ms ease-out', style({ backgroundColor: '#ffff33' })),
                animate('750ms ease-in', style({ backgroundColor: '#ffffff' }))
            ])
        ])
    ],
    standalone: false
})
export class PracticeHistoryListComponent {
  @Input() histories: VocabPracticeHistory[];
  @Input() mark: number;

  constructor() {
  }
}
