import {Component, Input, OnInit} from '@angular/core';
import {animate, style, transition, trigger, state} from '@angular/animations';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
  animations: [
    trigger('change', [
      state('correct', style({ color: '#00FF00'})),
      transition('* => correct', [animate('1s ease-in')]),
    ])
  ]
})
export class CharacterComponent implements OnInit {
  _character: string;
  isBlink = false;
  @Input() state = '';

  @Input()
  set character(character: string) {
    this._character = character;
    this.isBlink = character === '_';
  }

  constructor() {}

  ngOnInit() {}

  correct() { this.state = 'correct'; }
}
