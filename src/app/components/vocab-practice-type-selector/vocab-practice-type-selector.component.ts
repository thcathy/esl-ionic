import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, QueryList, ViewChildren} from '@angular/core';
import {Dictations} from '../../entity/dictation';
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
  readonly repeatChoices = [1, 2, 3];
  autoPlayNext = false;
  repeatCount = 1;
  speed = 0.7;
  pauseSeconds = 5;
  private syncing = false;

  get speedLabel(): string {
    return this.speed.toFixed(1);
  }

  get practiceType() { return VocabPracticeType; }

  ngOnChanges() {
    this.syncRadios();
  }

  ngAfterViewInit() {
    this.syncRadios();
  }

  slower() {
    this.speed = Math.max(0.1, Math.round((this.speed - 0.1) * 10) / 10);
  }

  faster() {
    this.speed = Math.min(1, Math.round((this.speed + 0.1) * 10) / 10);
  }

  changePause(delta: number) {
    if (!this.autoPlayNext) {
      return;
    }
    this.pauseSeconds = Math.min(10, Math.max(1, this.pauseSeconds + delta));
  }

  applyPaperPlayback(options: Dictations.Options): void {
    if (this.selectedType !== VocabPracticeType.Paper) {
      options.autoPlayNext = false;
      return;
    }
    options.autoPlayNext = this.autoPlayNext;
    options.repeatCount = this.repeatCount;
    options.speakRate = this.speed;
    options.pauseSeconds = this.pauseSeconds;
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
