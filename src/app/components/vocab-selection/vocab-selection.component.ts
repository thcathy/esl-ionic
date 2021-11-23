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
  selectedVocabs: MemberVocabulary[] = [];

  constructor() {
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

    this.inputVocab = [
      {
        id: {member: member1, word: 'apple'},
        correct: 3, wrong: 1
      },
      {
        id: {member: member1, word: 'banana'},
        correct: 2, wrong: 3
      },
      {
        id: {member: member1, word: 'cat'},
        correct: 5, wrong: 0
      },
      {
        id: {member: member1, word: 'apple'},
        correct: 3, wrong: 1
      },
      {
        id: {member: member1, word: 'banana'},
        correct: 2, wrong: 3
      },
      {
        id: {member: member1, word: 'cat'},
        correct: 5, wrong: 0
      },
      {
        id: {member: member1, word: 'apple'},
        correct: 3, wrong: 1
      },
      {
        id: {member: member1, word: 'banana'},
        correct: 2, wrong: 3
      },
      {
        id: {member: member1, word: 'cat'},
        correct: 5, wrong: 0
      },
      {
        id: {member: member1, word: 'apple'},
        correct: 3, wrong: 1
      },
      {
        id: {member: member1, word: 'banana'},
        correct: 2, wrong: 3
      },
      {
        id: {member: member1, word: 'cat'},
        correct: 5, wrong: 0
      },
      {
        id: {member: member1, word: 'apple'},
        correct: 3, wrong: 1
      },
      {
        id: {member: member1, word: 'banana'},
        correct: 2, wrong: 3
      },
      {
        id: {member: member1, word: 'cat'},
        correct: 5, wrong: 0
      },
      {
        id: {member: member1, word: 'apple'},
        correct: 3, wrong: 1
      },
      {
        id: {member: member1, word: 'banana'},
        correct: 2, wrong: 3
      },
      {
        id: {member: member1, word: 'cat'},
        correct: 5, wrong: 0
      },
      {
        id: {member: member1, word: 'apple'},
        correct: 3, wrong: 1
      },
      {
        id: {member: member1, word: 'banana'},
        correct: 2, wrong: 3
      },
      {
        id: {member: member1, word: 'cat'},
        correct: 5, wrong: 0
      },
      {
        id: {member: member1, word: 'apple'},
        correct: 3, wrong: 1
      },
      {
        id: {member: member1, word: 'banana'},
        correct: 2, wrong: 3
      },
      {
        id: {member: member1, word: 'cat'},
        correct: 5, wrong: 0
      },
    ];
  }
}
