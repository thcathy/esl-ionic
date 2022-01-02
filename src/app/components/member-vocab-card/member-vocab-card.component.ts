import {Component, Input, OnInit} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {ModalController} from '@ionic/angular';
import {MemberVocabulary} from '../../entity/member-vocabulary';

@Component({
  selector: 'app-member-vocab-card',
  templateUrl: './member-vocab-card.component.html',
  styleUrls: ['./member-vocab-card.component.scss'],
})
export class MemberVocabCardComponent implements OnInit {

  @Input() dictation: Dictation;
  @Input() memberVocabularies: MemberVocabulary[];

  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

}
