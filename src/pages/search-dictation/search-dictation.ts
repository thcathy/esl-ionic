import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Dictation, SuitableStudentOptions} from "../../entity/dictation";
import {DictationService} from "../../providers/dictation/dictation.service";
import {TranslateService} from "@ngx-translate/core";

export interface DateSearchOption {
  option: string;
  date?: Date;
}

@IonicPage()
@Component({
  selector: 'page-search-dictation',
  templateUrl: 'search-dictation.html',
})
export class SearchDictationPage {
  inputForm: FormGroup;
  moreOptions: boolean = false;
  results: Dictation[];
  suitableStudentOptions = SuitableStudentOptions;
  dateOptions = this.createDateOptions();

  constructor(
    public navCtrl: NavController,
    public ga: GoogleAnalytics,
    public formBuilder: FormBuilder,
    public dictationService: DictationService,
    public translateService: TranslateService,
    public loadingCtrl: LoadingController,
  ) {
    this.createForm();
  }

  ionViewDidLoad() { this.ga.trackView('search-dictation'); }

  get keyword() { return this.inputForm.get('keyword'); }
  get minDate() { return this.inputForm.get('minDate'); }
  get creator() { return this.inputForm.get('creator'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'keyword': new FormControl('', [Validators.minLength(3),  Validators.maxLength(50)]),
      'minDate': this.dateOptions[0],
      'creator': new FormControl('', [Validators.minLength(3),  Validators.maxLength(50)]),
      'suitableStudent': 'Any',
    });
    this.inputForm.get('suitableStudent').setValue('Any');
  }

  search() {
    this.results = null;
    let loader = this.loadingCtrl.create({ content: this.translateService.instant('Please wait') + "..." });
    loader.present();

    this.dictationService.search({
      keyword: this.keyword.value,
      minDate: this.minDate.value.date,
      creator: this.creator.value,
      suitableStudent: this.suitableStudent.value
    }).subscribe(r => {
      loader.dismissAll();
      this.results = r;
    }, _e => loader.dismissAll());
    this.moreOptions = false;
  }

  createDateOptions(): DateSearchOption[] {
    var options = [];
    options.push(<DateSearchOption>{
      option: 'Any'});
    let lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    options.push(<DateSearchOption>{
      option: 'Within 1 Month',
      date: lastMonth});

    let last3Month = new Date();
    last3Month.setMonth(last3Month.getMonth() - 3);
    options.push(<DateSearchOption>{
      option: 'Within 3 Month',
      date: last3Month});

    let last6Month = new Date();
    last6Month.setMonth(last6Month.getMonth() - 6);
    options.push(<DateSearchOption>{
      option: 'Within Half Year',
      date: last6Month});

    return options;
  }

  showHistory(ev: any) {

  }
}
