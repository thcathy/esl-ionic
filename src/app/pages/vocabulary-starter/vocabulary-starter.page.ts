import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {VocabDifficulty, vocabDifficulties} from "../../entity/voacb-practice";

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
  ) { }

  ngOnInit() {
    this.createForm();
  }

  get difficulty() { return this.inputForm.get('difficulty') }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'difficulty': VocabDifficulty.Beginner,
    });
  }

}
