import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Dictation} from "../../entity/dictation";
import {Vocab} from "../../entity/vocab";
import {NavigationService} from "../../providers/navigation.service";
import {Storage} from "@ionic/storage";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {ValidationUtils} from "../../utils/validation-utils";

@IonicPage()
@Component({
  selector: 'page-instant-dictation',
  templateUrl: 'instant-dictation.html',
})

export class InstantDictationPage {
  private INSTANT_DICTATION_KEY = 'INSTANT_DICTATION_KEY';

  maxVocab: number = 20;
  byWordInputForm: FormGroup;
  bySentenceInputForm: FormGroup;
  type: string = 'byword';

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
    this.byWordInputForm = this.formBuilder.group({
      showImage: true,
      vocabs: this.formBuilder.array([])
    });

    for (let i = 0; i < this.maxVocab; i++) {
      this.vocabs.push(this.formBuilder.group({
        'word': new FormControl('',[Validators.pattern("([a-zA-Z \\-']+)?")])
      }));
    }

    this.bySentenceInputForm = this.formBuilder.group({
      article: new FormControl('',[Validators.minLength(1)])
    });
  }

  ionViewWillEnter() {
    this.ga.trackView('instant-dictation')
  }

  get vocabs(): FormArray {
    return this.byWordInputForm.get('vocabs') as FormArray;
  }

  ionViewDidLoad() {
    this.getFromLocalStorage();
  }

  getFromLocalStorage() {
    this.storage.get(this.INSTANT_DICTATION_KEY).then((dictation: Dictation) => {
      console.log(`dictation: ${JSON.stringify(dictation)}`);
      if (dictation==null) return;

      if (!ValidationUtils.isBlankString(dictation.article)) {
        this.type = 'bysentence';
        this.bySentenceInputForm.get('article').setValue(dictation.article);
      } else {
        this.byWordInputForm.get('showImage').setValue(dictation.showImage);
        for (let i = 0; i < dictation.vocabs.length; i++) {
          this.vocabs.at(i).patchValue(dictation.vocabs[i]);
        }
      }
    });
  }

  clearVocabs() {
    this.vocabs.controls.forEach(x => {
      x.patchValue({word: ''})
    });
  }

  clearArticle() {
    this.bySentenceInputForm.get('article').setValue('');
  }

  startByWord() {
    let d = this.prepareVocabDictation();
    this.storage.set(this.INSTANT_DICTATION_KEY, d);
    this.navService.startDictation(d);
  }

  startBySentence() {
    let d = this.prepareArticleDictation();
    this.storage.set(this.INSTANT_DICTATION_KEY, d);
    this.navService.startArticleDictation(d);
  }

  prepareArticleDictation(): Dictation {
    return <Dictation>{
      id: -1,
      article: this.bySentenceInputForm.get('article').value,
      totalRecommended: 0,
      title: new Date().toDateString(),
      suitableStudent: 'Any',
    };

  }

  prepareVocabDictation(): Dictation {
    const formModel = this.byWordInputForm.value;
    const vocabInputs: Vocab[] = formModel.vocabs
      .map(v => new Vocab(v.word))
      .filter(v => v.word.length > 0);

    return <Dictation>{
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

