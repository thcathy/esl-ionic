import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Dictation} from "../../entity/dictation";
import {Vocab} from "../../entity/vocab";
import {NavigationService} from "../../providers/navigation.service";
import {Storage} from "@ionic/storage";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

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
    public navService: NavigationService,
    public storage: Storage,
    public ga: GoogleAnalytics,
    ) {
    this.createForm();
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      showImage: '',
      vocabs: this.formBuilder.array([])
    });

    for (let i = 0; i < this.maxVocab; i++) {
      this.vocabs.push(this.formBuilder.group({
        'word': new FormControl('',[Validators.pattern("([a-zA-Z \\-']+)?")])
      }));
    }
  }

  ionViewWillEnter() {
    this.ga.trackView('instant-dictation')
  }

  get vocabs(): FormArray {
    return this.inputForm.get('vocabs') as FormArray;
  }

  ionViewDidLoad() {
    this.getFromLocalStorage();
  }

  getFromLocalStorage() {
    this.storage.get(this.INSTANT_DICTATION_KEY).then((dictation: Dictation) => {
      this.inputForm.get('showImage').setValue(dictation.showImage);

      for (let i = 0; i < dictation.vocabs.length; i++) {
        this.vocabs.at(i).setValue(dictation.vocabs[i]);
      }
    });
  }

  clearVocabs() {
    this.vocabs.controls.forEach(x => {
      x.patchValue({word: ''})
    })
  }

  start() {
    let d = this.prepareDictation();
    this.storage.set(this.INSTANT_DICTATION_KEY, d);
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
      suitableStudent: 'Any',
    };

  }

  keytab(_event, i: number){
    i++;
    if (i >= this.maxVocab) i = 0;
    let element2 = document.getElementById('vocab' + i).firstElementChild as HTMLInputElement;

    if (element2 != null)
      element2.focus();
  }

}

