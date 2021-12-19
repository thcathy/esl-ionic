import {Component, Input, OnInit} from '@angular/core';
import {MemberVocabulary} from '../../entity/member-vocabulary';
import {Member} from '../../entity/member';
import {Name} from '../../entity/name';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {EditDictationRequest, MemberDictationService} from '../../services/dictation/member-dictation.service';
import {DictationType} from '../../pages/edit-dictation/edit-dictation-page-enum';
import {DictationUtils} from '../../utils/dictation-utils';
import {Dictation} from '../../entity/dictation';

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
    public modalController: ModalController,
    public memberDictationService: MemberDictationService,
  ) {
    this.selectedVocabs = new Map<string, MemberVocabulary>();
    this.setTestingData();
  }

  get title() { return this.inputForm.get('title'); }

  createAndSetupForm() {
    const controlsConfig = {};
    controlsConfig['title'] = new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]);
    this.inputForm = this.formBuilder.group(controlsConfig);
    this.title.setValue(`My exercise ${new Date().toISOString().split('T')[0]}`);
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
    this.memberDictationService.createOrAmendDictation(<EditDictationRequest>{
      dictationId: -1,
      title: this.title.value,
      showImage: true,
      vocabulary: Array.from(this.selectedVocabs.keys()),
      wordContainSpace : true,
      source : Dictation.Source.Select,
    }).subscribe(
      dic => this.afterSaved(dic),
      err => this.showError(err)
    );
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

  clearSelected() {
    this.selectedVocabs.clear();
  }
}
