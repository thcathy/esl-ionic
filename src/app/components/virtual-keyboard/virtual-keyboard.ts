import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UIOptionsService} from '../../services/ui-options.service';

export enum VirtualKeyboardEvent {
  Backspace = 'Backspace',
  Clear = 'Clear',
  Close = 'Close',
  Open = 'Open'
}

export enum VirtualKeyboardType {
  None = 'None',
  Standard = 'Standard',
  Alphabetical = 'Alphabetical'
}

@Component({
  selector: 'virtual-keyboard',
  templateUrl: 'virtual-keyboard.html',
  styleUrls: ['virtual-keyboard.scss'],
})
export class VirtualKeyboardComponent {
  @Output() keyPress = new EventEmitter<string>();
  @Output() keyboardEvent = new EventEmitter<VirtualKeyboardEvent>();
  activeType = VirtualKeyboardType.None;

  constructor(public uiOptionsService: UIOptionsService) {
    this.uiOptionsService.loadOption(UIOptionsService.keys.keyboardType)
      .then(v => this.setKeyboardType(v));
  }

  onKeyPress(key: string) {
    this.keyPress.emit(key);
  }

  onEvent(event: VirtualKeyboardEvent) {
    this.keyboardEvent.emit(event);
  }

  setKeyboardType(type: VirtualKeyboardType) {
    this.activeType = (type == null) ? VirtualKeyboardType.Standard : type;
    if (type === VirtualKeyboardType.None) {
      this.onEvent(VirtualKeyboardEvent.Close);
    } else {
      this.onEvent(VirtualKeyboardEvent.Open);
    }
    this.uiOptionsService.saveOption(UIOptionsService.keys.keyboardType, this.activeType);
  }

  changeKeyboardType() {
    if (this.activeType === VirtualKeyboardType.None) {
      this.setKeyboardType(VirtualKeyboardType.Standard);
    } else if (this.activeType === VirtualKeyboardType.Standard) {
      this.setKeyboardType(VirtualKeyboardType.Alphabetical);
    } else if (this.activeType === VirtualKeyboardType.Alphabetical) {
      this.setKeyboardType(VirtualKeyboardType.None);
    }
  }

  get virtualKeyboardEvent() { return VirtualKeyboardEvent; }
  get virtualKeyboardType() { return VirtualKeyboardType; }
}
