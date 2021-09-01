import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {VocabDifficulty, vocabDifficulties} from '../../entity/voacb-practice';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {NavigationService} from '../../services/navigation.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs-compat/operator/switchMap';
import {map} from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {DictationType} from '../edit-dictation/edit-dictation-page-enum';
import {PracticeCompletePageInput} from '../practice-complete/practice-complete.page';
import {Dictation, DictationOptions} from '../../entity/dictation';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'app-vocabulary-starter',
  templateUrl: './vocabulary-starter.page.html',
  styleUrls: ['./vocabulary-starter.page.scss'],
})
export class VocabularyStarterPage implements OnInit {
  inputKey = 'VocabularyStarterPage.vocabularyStarterPageInput';
  inputForm: FormGroup;
  vocabDifficulties: String[] = vocabDifficulties;

  constructor(
    public formBuilder: FormBuilder,
    public vocabPracticeService: VocabPracticeService,
    public navigationService: NavigationService,
    public route: ActivatedRoute,
    public authService: AuthService,
    public storage: Storage,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  ionViewWillEnter() {
    this.setupInput();
  }

  get difficulty() { return this.inputForm.get('difficulty'); }
  get type() { return this.inputForm.get('type'); }
  get practiceType() { return VocabPracticeType; }

  async setupInput() {
    const input = <VocabularyStarterPageInput> await this.storage.get(this.inputKey);
    if (input?.difficulty !== undefined) { this.difficulty.setValue(input.difficulty); }
    if (input?.type !== undefined) { this.type.setValue(input.type); }
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'difficulty': '',
      'type': '',
    });
    this.difficulty.setValue(VocabDifficulty.Beginner);
    this.type.setValue(VocabPracticeType.Spell);
  }

  start() {
    this.saveInput();
    this.vocabPracticeService.generatePractice(this.difficulty.value)
      .subscribe(d => {
        d.options = { 'practiceType': this.type.value ?? VocabPracticeType.Spell };
        this.navigationService.startDictation(d);
      });
  }

  saveInput() {
    this.storage.set(this.inputKey, <VocabularyStarterPageInput>{
      difficulty: this.difficulty.value,
      type: this.type.value,
    });
  }
}

export interface VocabularyStarterPageInput {
  difficulty: VocabDifficulty;
  type: VocabPracticeType;
}
