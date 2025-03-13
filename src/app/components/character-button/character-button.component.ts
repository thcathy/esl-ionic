import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
    selector: 'app-character-button',
    templateUrl: './character-button.component.html',
    styleUrls: ['./character-button.component.scss'],
    animations: [
        trigger('change', [
            transition('* => wrong', [
                animate('500ms ease-out', style({
                    color: '#FF4500',
                    transform: 'scale(1.3) translateY(-5%)',
                })),
                animate('500ms ease-in', style({
                    transform: 'scale(1)'
                }))
            ]),
            transition('* => correct', [
                animate('500ms ease-out', style({
                    color: '#00FF00',
                    transform: 'scale(1.3) translateY(-5%)',
                })),
                animate('500ms ease-in', style({
                    transform: 'scale(1)'
                }))
            ]),
        ])
    ],
    standalone: false
})
export class CharacterButtonComponent implements OnInit {
  @Input() character: string;
  @Input() isCorrect: boolean;
  @Output() correctPress = new EventEmitter<string>();

  state = '';

  constructor() { }

  ngOnInit() {}

  onClick() {
    if (this.state !== '') {
      return;
    }

    if (this.isCorrect) {
      this.state = 'correct';
      console.log(`passed correct button`);
      this.correctPress.emit(this.character);
    } else {
      this.state = 'wrong';
    }
    setTimeout(() => this.state = '', 1000);
  }

}
