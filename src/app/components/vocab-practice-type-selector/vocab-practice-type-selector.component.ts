import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, QueryList, ViewChildren} from '@angular/core';
import {resolveVocabPracticeType, VocabPracticeType} from '../../enum/vocab-practice-type.enum';

@Component({
  selector: 'app-vocab-practice-type-selector',
  templateUrl: './vocab-practice-type-selector.component.html',
  styleUrls: ['./vocab-practice-type-selector.component.scss'],
  standalone: false
})
export class VocabPracticeTypeSelectorComponent implements OnChanges, AfterViewInit {
  @Input() selectedType: VocabPracticeType = VocabPracticeType.Spell;
  @Output() selectedTypeChange = new EventEmitter<VocabPracticeType>();
  @ViewChildren('typeRadio') radios: QueryList<ElementRef<HTMLInputElement>>;

  readonly radioName = `vocab-practice-type-${Math.random().toString(36).slice(2)}`;
  private syncing = false;

  get practiceType() { return VocabPracticeType; }

  ngOnChanges() {
    this.syncRadios();
  }

  ngAfterViewInit() {
    this.syncRadios();
  }

  onRadioChange(event: Event, value: VocabPracticeType) {
    if (this.syncing || !(event.target as HTMLInputElement).checked) {
      return;
    }
    this.onSelectedTypeChange(value);
  }

  onSelectedTypeChange(value: VocabPracticeType) {
    const resolved = resolveVocabPracticeType(value);
    if (resolved === this.selectedType) {
      return;
    }
    this.selectedType = resolved;
    this.selectedTypeChange.emit(this.selectedType);
    this.syncRadios();
  }

  private syncRadios() {
    if (!this.radios) {
      return;
    }
    this.syncing = true;
    this.radios.forEach(radio => {
      radio.nativeElement.checked = radio.nativeElement.value === this.selectedType;
    });
    this.syncing = false;
  }
}
