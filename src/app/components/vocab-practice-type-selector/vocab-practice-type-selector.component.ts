import {Component, EventEmitter, Input, Output} from '@angular/core';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';

@Component({
  selector: 'app-vocab-practice-type-selector',
  templateUrl: './vocab-practice-type-selector.component.html',
  styleUrls: ['./vocab-practice-type-selector.component.scss'],
  standalone: false
})
export class VocabPracticeTypeSelectorComponent {
  @Input() selectedType: VocabPracticeType = VocabPracticeType.Spell;
  @Output() selectedTypeChange = new EventEmitter<VocabPracticeType>();

  get practiceType() { return VocabPracticeType; }

  onSelectedTypeChange(value: VocabPracticeType) {
    this.selectedType = value ?? VocabPracticeType.Spell;
    this.selectedTypeChange.emit(this.selectedType);
  }
}
