import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-character-button',
  templateUrl: './character-button.component.html',
  styleUrls: ['./character-button.component.scss'],
  animations: [
    trigger('change', [
      transition('* => wrong', [
        animate('500ms ease-out',
          style({
            color: '#FF4500',
            transform: 'scale(1.5)'
          })
        ),
        animate('500ms ease-in', style({
          transform: 'scale(1)'
        }))
      ]),
      transition('* => correct', [
        animate('500ms ease-out',
          style({
            color: '#00FF00',
            transform: 'scale(1.5)'
          })
        ),
        animate('500ms ease-in', style({
          transform: 'scale(1)'
        }))
      ]),
    ])
  ]
})
export class CharacterButtonComponent implements OnInit {
  @Input() character: string;
  @Input() isCorrect: boolean;
  @Output() correctPress = new EventEmitter<boolean>();

  state = '';

  constructor() { }

  ngOnInit() {}

  onClick() {
    if (this.isCorrect) {
      if (this.state === '') {
        this.correctPress.emit(true);
      }
      this.state = 'correct';
    } else {
      this.state = 'wrong';
    }
  }

  changeDone($event: any): void {
    this.state = '';
  }

}
