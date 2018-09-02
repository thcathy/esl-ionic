import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NavigationService} from "../../services/navigation.service";
import {AlertController} from "@ionic/angular";
import {Storage} from '@ionic/storage';
import {TranslateService} from "@ngx-translate/core";
import {DictationService} from "../../services/dictation/dictation.service";
import {Dictation} from "../../entity/dictation";
import {Vocab} from "../../entity/vocab";
import {ValidationUtils} from "../../utils/validation-utils";

@Component({
  selector: 'app-instant-dictation',
  templateUrl: './instant-dictation.page.html',
  styleUrls: ['./instant-dictation.page.scss'],
})
export class InstantDictationPage implements OnInit {
  private INSTANT_DICTATION_KEY = 'INSTANT_DICTATION_KEY';

  maxVocab: number = 20;
  byWordInputForm: FormGroup;
  bySentenceInputForm: FormGroup;
  type: string = 'byword';

  constructor(
    public formBuilder: FormBuilder,
    public navService: NavigationService,
    public storage: Storage,
    public alertController: AlertController,
    public translate: TranslateService,
    public dictationService: DictationService,
  ) { }

  ngOnInit() {
    console.log(`instant-dictation ngOnInit`);
    this.getFromLocalStorage();
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
      article: new FormControl('',[Validators.required])
    });
  }

  get vocabs(): FormArray {
    return this.byWordInputForm.get('vocabs') as FormArray;
  }

  getFromLocalStorage() {
    this.storage.get(this.INSTANT_DICTATION_KEY).then((dictation: Dictation) => {
      console.log(`dictation: ${JSON.stringify(dictation)}`);
      if (dictation==null) return;

      if (this.dictationService.isSentenceDictation(dictation)) {
        this.type = 'bysentence';
        this.bySentenceInputForm.get('article').setValue(dictation.article);
      } else {
        this.byWordInputForm.get('showImage').setValue(dictation.showImage);
        if (dictation.vocabs != null) {
          for (let i = 0; i < dictation.vocabs.length; i++) {
            this.vocabs.at(i).patchValue(dictation.vocabs[i]);
          }
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
    if (d.vocabs.length < 1) {
      this.showNoVocabAlert();
      return;
    }

    this.storage.set(this.INSTANT_DICTATION_KEY, d);
    this.navService.startDictation(d);
  }

  async showNoVocabAlert() {
    const alert = await this.alertController.create({
      header: `${this.translate.instant('At least input 1 word')}!`,
      buttons: [this.translate.instant('OK')]
    });
    await alert.present();
  }

  startBySentence() {
    let d = this.prepareArticleDictation();
    this.storage.set(this.INSTANT_DICTATION_KEY, d);
    this.navService.startDictation(d);
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
      .filter(v => !ValidationUtils.isBlankString(v.word));

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
