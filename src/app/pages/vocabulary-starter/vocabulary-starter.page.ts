import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {VocabDifficulty, vocabDifficulties} from "../../entity/voacb-practice";
import {VocabPracticeService} from "../../services/practice/vocab-practice.service";
import {NavigationService} from "../../services/navigation.service";
import {IonicComponentService} from "../../services/ionic-component.service";
import {ActivatedRoute} from "@angular/router";
import {switchMap} from "rxjs-compat/operator/switchMap";
import {map} from "rxjs/operators";
import {AuthService} from "../../services/auth.service";

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
    public route: ActivatedRoute,
    public authService: AuthService,
  ) { }

  ngOnInit() {
    this.createForm();
    this.route.paramMap.pipe(
      map(params => {
        this.difficulty.setValue(params.get('difficulty'));
      })
    );
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
