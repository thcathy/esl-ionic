import {Component, EventEmitter, Input, Output} from '@angular/core';

const WRONG_RESET_MS = 500;
const CORRECT_RESET_MS = 400;

@Component({
    selector: 'app-character-button',
    templateUrl: './character-button.component.html',
    styleUrls: ['./character-button.component.scss'],
    standalone: false
})
export class CharacterButtonComponent {
  @Input() character: string;
  @Input() isCorrect: boolean;
  @Output() correctPress = new EventEmitter<string>();

  state = '';

  onClick() {
    if (this.state !== '') {
      return;
    }

    if (this.isCorrect) {
      this.state = 'correct';
      this.correctPress.emit(this.character);
      setTimeout(() => this.state = '', CORRECT_RESET_MS);
    } else {
      this.state = 'wrong';
      setTimeout(() => this.state = '', WRONG_RESET_MS);
    }
  }
}
