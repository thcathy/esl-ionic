import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {IonModal} from '@ionic/angular';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';

@Component({
  selector: 'app-vocab-practice-type-modal',
  templateUrl: './vocab-practice-type-modal.component.html',
  styleUrls: ['./vocab-practice-type-modal.component.scss'],
  standalone: false
})
export class VocabPracticeTypeModalComponent {
  @Input() selectedType: VocabPracticeType = VocabPracticeType.Spell;
  @Output() confirmed = new EventEmitter<VocabPracticeType>();

  @ViewChild('vocabPracticeTypeModal') modal: IonModal;

  get practiceType() { return VocabPracticeType; }

  open(initialType: VocabPracticeType) {
    this.selectedType = initialType ?? VocabPracticeType.Spell;
    this.modal.present();
  }

  dismiss() {
    this.modal.dismiss();
  }

  start() {
    this.dismiss();
    this.confirmed.emit(this.selectedType);
  }
}
