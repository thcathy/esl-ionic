import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {VocabDifficulty, vocabDifficulties} from "../../entity/voacb-practice";
import {VocabPracticeService} from "../../services/practice/vocab-practice.service";
import {NavigationService} from "../../services/navigation.service";

@Component({
  selector: 'app-vocabulary-starter',
  templateUrl: './vocabulary-starter.page.html',
  styleUrls: ['./vocabulary-starter.page.scss'],
})
export class VocabularyStarterPage implements OnInit {
  inputForm: FormGroup;
  vocabDifficulties: String[] = vocabDifficulties;

  constructor(
    public formBuilder: FormBuilder,
    public vocabPracticeService: VocabPracticeService,
    public navigationService: NavigationService,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  get difficulty() { return this.inputForm.get('difficulty') }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'difficulty': '',
    });
    this.inputForm.get('difficulty').setValue(VocabDifficulty.Beginner);
  }

  start() {
    this.vocabPracticeService.generatePractice(this.difficulty.value)
      .subscribe(d => this.navigationService.startDictation(d));
  }

}
