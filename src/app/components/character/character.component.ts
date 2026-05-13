import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-character',
    templateUrl: './character.component.html',
    styleUrls: ['./character.component.scss'],
    standalone: false
})
export class CharacterComponent {
  _character: string;
  isBlink = false;
  isFuture = false;
  @Input() state = '';

  @Input()
  set character(character: string) {
    this._character = character;
    this.isBlink = character === '_';
    this.isFuture = character === '?';
  }
}
