import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@IonicPage()
@Component({
  selector: 'page-instant-dictation',
  templateUrl: 'instant-dictation.html',
})
export class InstantDictationPage {
  maxVocab: number = 20;
  inputForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder) {

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

  ionViewDidLoad() {}

  clearVocabs() {
    this.vocabs.controls.forEach(x => {
      x.patchValue({word: ''})
    })
  }

}
