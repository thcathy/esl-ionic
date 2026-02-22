import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UIOptionsService} from '../../services/ui-options.service';

@Component({
  selector: 'app-voice-mode-selector',
  templateUrl: './voice-mode-selector.component.html',
  styleUrls: ['./voice-mode-selector.component.scss'],
  standalone: false
})
export class VoiceModeSelectorComponent {
  @Input() selectedMode = UIOptionsService.voiceMode.online;
  @Output() selectedModeChange = new EventEmitter<string>();

  get voiceMode() { return UIOptionsService.voiceMode; }

  onSelectedModeChange(mode: string) {
    const normalized = mode === UIOptionsService.voiceMode.local
      ? UIOptionsService.voiceMode.local
      : UIOptionsService.voiceMode.online;
    this.selectedMode = normalized;
    this.selectedModeChange.emit(normalized);
  }
}
