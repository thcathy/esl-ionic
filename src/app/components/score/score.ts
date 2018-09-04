import { Component, Input} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";

@Component({
  selector: 'score',
  templateUrl: 'score.html',
  styleUrls: ['score.scss'],
  animations: [
    trigger('change', [
      state('highlight', style({backgroundColor: 'transparent'})),
      transition('* => highlight', [
        animate('750ms ease-out',
          style({
            color: '#ffff33',
            transform: 'scale(1.2)'
          })
        ),
        animate('750ms ease-in', style({color: '#ffffff'}))
      ])
    ])
  ]
})
export class ScoreComponent {
  @Input() total: VocabPracticeHistory[];
  _mark: number;
  state: string;

  constructor() {
  }

  @Input()
  set mark(mark: number) {
    this._mark = mark;
    if (mark != 0) this.state = 'highlight';
  }

  get mark(): number { return this._mark; }

  changeDone($event: any) : void {
    this.state = '';
  }

}
