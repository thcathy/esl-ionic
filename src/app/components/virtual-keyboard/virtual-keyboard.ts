import {Component, EventEmitter, Input, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";

@Component({
  selector: 'virtual-keyboard',
  templateUrl: 'virtual-keyboard.html',
  styleUrls: ['virtual-keyboard.scss'],
})
export class VirtualKeyboardComponent {
  @Output() keyPress = new EventEmitter<string>();
  @Output() backspace = new EventEmitter<boolean>();

  constructor() {}

  onKeyPress(key: string) {
    this.keyPress.emit(key);
  }

  onBackspace() {
    this.backspace.emit(true);
  }
}
