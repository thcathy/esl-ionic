import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Dictation, SuitableStudentOptions} from '../../entity/dictation';
import {TranslateService} from '@ngx-translate/core';
import {DictationService} from '../../services/dictation/dictation.service';
import {ValidationUtils} from '../../utils/validation-utils';
import {IonicComponentService} from '../../services/ionic-component.service';
import {Storage} from '@ionic/storage';

export interface DateSearchOption {
  option: string;
  date?: Date;
}

@Component({
  selector: 'app-search-dictation',
  templateUrl: './search-dictation.page.html',
  styleUrls: ['./search-dictation.page.scss'],
})
export class SearchDictationPage implements OnInit {
  SEARCH_HISTORY_KEY = 'SEARCH_HISTORY_KEY';
  MAX_HISTORY = 10;

  inputForm: FormGroup;
  moreOptions = false;
  results: Dictation[];
  suitableStudentOptions = SuitableStudentOptions;
  dateOptions = this.createDateOptions();
  history: String[] = [];
  filteredHistory: String[] = [];
  showHistory = false;

  constructor(
    public formBuilder: FormBuilder,
    public dictationService: DictationService,
    public translateService: TranslateService,
    public storage: Storage,
    public ionicComponentService: IonicComponentService,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  get keyword() { return this.inputForm.get('keyword'); }
  get minDate() { return this.inputForm.get('minDate'); }
  get creator() { return this.inputForm.get('creator'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }
  get type() { return this.inputForm.get('type'); }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'keyword': new FormControl('', [Validators.pattern('.{3,}|[0-9]{1,}'), Validators.maxLength(50)]),
      'minDate': this.dateOptions[0],
      'creator': new FormControl('', [Validators.minLength(3), Validators.maxLength(50)]),
      'suitableStudent': 'Any',
      'type': 'Any',
    });
    this.inputForm.get('suitableStudent').setValue('Any');
  }

  ionViewDidLoad() {
    this.storage.get(this.SEARCH_HISTORY_KEY).then(h => {
      this.history = h ? h : [];
    });
  }

  async search() {
    this.results = null;
    const loader = await this.ionicComponentService.showLoading();

    this.addToHistory(this.keyword.value);
    this.dictationService.search({
      keyword: this.keyword.value,
      minDate: this.minDate.value.date,
      creator: this.creator.value,
      suitableStudent: this.suitableStudent.value,
      type: this.type.value === 'Any' ? null : this.type.value,
    }).subscribe(r => {
      loader.dismiss();
      this.results = r;
    }, _e => loader.dismiss());
  }

  createDateOptions(): DateSearchOption[] {
    const options = [];
    options.push(<DateSearchOption>{
      option: 'Any'
    });
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    options.push(<DateSearchOption>{
      option: 'Within 1 Month',
      date: lastMonth
    });

    const last3Month = new Date();
    last3Month.setMonth(last3Month.getMonth() - 3);
    options.push(<DateSearchOption>{
      option: 'Within 3 Month',
      date: last3Month
    });

    const last6Month = new Date();
    last6Month.setMonth(last6Month.getMonth() - 6);
    options.push(<DateSearchOption>{
      option: 'Within Half Year',
      date: last6Month
    });

    return options;
  }

  private addToHistory(value: String) {
    if (this.history.find(h => h == value)) { return; }

    this.history.unshift(value);
    if (this.history.length > this.MAX_HISTORY) { this.history.pop(); }
    this.storage.set(this.SEARCH_HISTORY_KEY, this.history);
  }

  filterHistory(event: any) {
    const input = this.keyword.value;
    if (ValidationUtils.isBlankString(input)) {
      this.filteredHistory = [];
    }
    else {
      this.filteredHistory = this.history.filter(value => value.startsWith(input) && value != input);
    }
    this.showHistory = true;
  }

  setKeyword(h: String) {
    this.keyword.setValue(h);
    this.showHistory = false;
  }

  stopShowHistory() {
    this.showHistory = false;
  }
}
