import {Component, Input, OnInit} from '@angular/core';
import {MemberVocabulary} from '../../entity/member-vocabulary';
import {Member} from '../../entity/member';
import {Name} from '../../entity/name';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {EditDictationRequest, MemberDictationService} from '../../services/dictation/member-dictation.service';
import {Dictation, Dictations} from '../../entity/dictation';
import {TranslateService} from '@ngx-translate/core';
import {IonicComponentService} from '../../services/ionic-component.service';

@Component({
  selector: 'app-vocab-selection',
  templateUrl: './vocab-selection.component.html',
  styleUrls: ['./vocab-selection.component.scss'],
})
export class VocabSelectionComponent implements OnInit {
  EACH_LOADING_SIZE = 100;

  @Input() inputVocab: MemberVocabulary[];
  showingVocabs: MemberVocabulary[] = [];
  selectedVocabs: Map<string, MemberVocabulary>;

  inputForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public modalController: ModalController,
    public memberDictationService: MemberDictationService,
    public translate: TranslateService,
    public ionicComponentService: IonicComponentService,
  ) {
    this.selectedVocabs = new Map<string, MemberVocabulary>();
  }

  get title() { return this.inputForm.get('title'); }

  createAndSetupForm() {
    const controlsConfig = {};
    controlsConfig['title'] = new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]);
    this.inputForm = this.formBuilder.group(controlsConfig);
    this.title.setValue(`My exercise ${new Date().toISOString().split('T')[0]}`);
  }

  ngOnInit() {
    if (this.inputVocab !== undefined) {
      this.showingVocabs = this.showingVocabs.concat(
        this.inputVocab.slice(this.showingVocabs.length, this.showingVocabs.length + this.EACH_LOADING_SIZE)
      );
    }
    this.createAndSetupForm();
  }

  loadData(event) {
    if (this.inputVocab !== undefined && this.showingVocabs.length < this.inputVocab.length) {
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

  isValid(): boolean { return this.selectedVocabs.size > 0; }

  createExercise() {
    if (!this.isValid()) {
      this.ionicComponentService.showAlert(this.translate.instant('No vocabulary selected'));
      return;
    }

    this.memberDictationService.createOrAmendDictation(<EditDictationRequest>{
      dictationId: -1,
      title: this.title.value,
      showImage: true,
      vocabulary: Array.from(this.selectedVocabs.keys()),
      wordContainSpace : true,
      source : Dictations.Source.Select,
    }).subscribe(
      dic => this.afterSaved(dic),
      err => this.showError(err)
    );
  }

  afterSaved(dictation: Dictation) {
    this.modalController.dismiss({
      'dictation': dictation
    });
  }

  showError(_err: string) {
    this.ionicComponentService.showAlert(this.translate.instant('Fail to create or update vocabulary exercise'));
  }

  clearSelected() {
    this.selectedVocabs.clear();
  }

  vocabTrackById(index, vocab: MemberVocabulary) { return vocab.id.word; }
}
