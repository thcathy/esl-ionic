import {Component, Input, OnInit} from '@angular/core';
import {MemberVocabulary} from '../../entity/member-vocabulary';
import {Member} from '../../entity/member';
import {Name} from '../../entity/name';

@Component({
  selector: 'app-vocab-selection',
  templateUrl: './vocab-selection.component.html',
  styleUrls: ['./vocab-selection.component.scss'],
})
export class VocabSelectionComponent implements OnInit {
  EACH_LOADING_SIZE = 10;

  @Input() inputVocab: MemberVocabulary[];
  showingVocabs: MemberVocabulary[] = [];
  selectedVocabs: Map<string, MemberVocabulary>;

  constructor() {
    this.selectedVocabs = new Map<string, MemberVocabulary>();
    this.setTestingData();
  }

  ngOnInit() {
    this.showingVocabs = this.showingVocabs.concat(
      this.inputVocab.slice(this.showingVocabs.length, this.showingVocabs.length + this.EACH_LOADING_SIZE)
    );
  }

  loadData(event) {
    if (this.showingVocabs.length < this.inputVocab.length) {
      this.showingVocabs = this.showingVocabs.concat(
        this.inputVocab.slice(this.showingVocabs.length, this.showingVocabs.length + this.EACH_LOADING_SIZE)
      );
    }
    event.target.complete();
  }

  selectVocab(vocab: MemberVocabulary) {
    const word = vocab.id.word;
    if (this.selectedVocabs.has(word)) {
      this.selectedVocabs.delete(word);
    } else {
      this.selectedVocabs.set(word, vocab);
    }
  }

  setTestingData() {
    const member1 = new Member(
      1,
      'tester1',
      new Name('Tester', 'A'),
      new Date('1980-03-02'),
      'address',
      '43420024',
      'A school name',
      20,
      'tester@gmail.com',
      null,
      new Date('2008-01-01'));

    this.inputVocab = Array.from(Array(100).keys()).map(x => {
      return {
        id: {member: member1, word: 'word' + x},
        correct: x, wrong: x
      };
    });
  }

}
