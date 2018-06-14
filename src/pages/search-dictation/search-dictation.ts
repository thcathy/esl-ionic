import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Dictation} from "../../entity/dictation";
import {DictationService} from "../../providers/dictation/dictation.service";

@IonicPage()
@Component({
  selector: 'page-search-dictation',
  templateUrl: 'search-dictation.html',
})
export class SearchDictationPage {
  inputForm: FormGroup;
  showDetails: boolean = false;
  results: Dictation[];

  constructor(
    public navCtrl: NavController,
    public ga: GoogleAnalytics,
    public formBuilder: FormBuilder,
    public dictationService: DictationService
  ) {
    this.createForm();
  }

  ionViewDidLoad() { this.ga.trackView('search-dictation'); }

  get keyword() { return this.inputForm.get('keyword'); }
  get minDate() { return this.inputForm.get('minDate'); }
  get maxDate() { return this.inputForm.get('maxDate'); }
  get creator() { return this.inputForm.get('creator'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'keyword': new FormControl('', [Validators.minLength(5),  Validators.maxLength(50)]),
      'minDate': '',
      'maxDate': '',
      'creator': new FormControl('', [Validators.minLength(3),  Validators.maxLength(50)]),
      'suitableStudent': 'Any',
    });
    this.inputForm.get('suitableStudent').setValue('Any');
  }

  search() {
    this.dictationService.search({
      keyword: this.keyword.value,
      minDate: this.minDate.value,
      maxDate: this.maxDate.value,
      creator: this.creator.value,
      suitableStudent: this.suitableStudent.value
    }).subscribe(r => this.results = r);
    this.showDetails = false;
  }
}
