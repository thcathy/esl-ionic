import {Component, Input, OnInit} from '@angular/core';
import {MemberVocabulary} from '../../entity/member-vocabulary';
import {Member} from '../../entity/member';
import {Name} from '../../entity/name';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

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

  inputForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
  ) {
    this.selectedVocabs = new Map<string, MemberVocabulary>();
    this.setTestingData();
  }

  get title() { return this.inputForm.get('title'); }
  get description() { return this.inputForm.get('description'); }
  get now() { return new Date(); }

  createAndSetupForm() {
    const controlsConfig = {};
    controlsConfig['title'] = new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]);
    controlsConfig['description'] = new FormControl('', [Validators.maxLength(100)]);
    this.inputForm = this.formBuilder.group(controlsConfig);
  }

  ngOnInit() {
    this.showingVocabs = this.showingVocabs.concat(
      this.inputVocab.slice(this.showingVocabs.length, this.showingVocabs.length + this.EACH_LOADING_SIZE)
    );
    this.createAndSetupForm();
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

  createExercise() {

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
