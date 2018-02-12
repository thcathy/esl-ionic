import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Dictation} from "../../entity/dictation";
import {Vocab} from "../../entity/vocab";
import {NavigationService} from "../../providers/navigation.service";

@IonicPage()
@Component({
  selector: 'page-instant-dictation',
  templateUrl: 'instant-dictation.html',
})

export class InstantDictationPage {
  private INSTANT_DICTATION_KEY = 'INSTANT_DICTATION_KEY';

  maxVocab: number = 20;
  inputForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public navService: NavigationService) {
    this.createForm();
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      showImage: '',
      vocabs: this.formBuilder.array([])
    });

    for (let i = 0; i < this.maxVocab; i++) {
      this.vocabs.push(this.formBuilder.group({
        'word': new FormControl('',[Validators.pattern("([a-zA-Z -']+)?")])
      }));
    }
  }

  get vocabs(): FormArray {
    return this.inputForm.get('vocabs') as FormArray;
  }

  ionViewDidLoad() {
    this.getFromLocalStorage();
  }

  getFromLocalStorage() {
    let dictationString = localStorage.getItem(this.INSTANT_DICTATION_KEY);
    if (dictationString != null) {
      let dictation: Dictation = JSON.parse(dictationString);
      this.inputForm.get('showImage').setValue(dictation.showImage);

      for (let i = 0; i < dictation.vocabs.length; i++) {
        this.vocabs.at(i).setValue(dictation.vocabs[i]);
      }
    }
  }

  clearVocabs() {
    this.vocabs.controls.forEach(x => {
      x.patchValue({word: ''})
    })
  }

  start() {
    let d = this.prepareDictation();
    localStorage.setItem(this.INSTANT_DICTATION_KEY,JSON.stringify(d));
    this.navService.startDictation(this.prepareDictation());
  }

  prepareDictation(): Dictation {
    const formModel = this.inputForm.value;
    const vocabInputs: Vocab[] = formModel.vocabs
      .map(v => new Vocab(v.word))
      .filter(v => v.word.length > 0);

    return {
      id: -1,
      showImage: formModel.showImage as boolean,
      vocabs: vocabInputs,
      totalRecommended: 0,
      title: new Date().toDateString(),
      suitableMaxAge: -1,
      suitableMinAge: -1,
    };

  }

  keytab(_event, i: number){
    i++;
    if (i >= this.maxVocab) i = 0;
    let element2 = document.getElementById('vocab' + i).firstElementChild;

    if (element2 != null)
      element2.focus();
  }

}

