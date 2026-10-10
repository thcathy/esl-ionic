import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Dictation, Dictations, SuitableStudentOptions} from '../../entity/dictation';
import {DICTATION_SEARCH_MAX_RESULTS, DictationService} from '../../services/dictation/dictation.service';
import {ValidationUtils} from '../../utils/validation-utils';
import {IonicComponentService} from '../../services/ionic-component.service';
import {StorageService} from '../../services/storage.service';

export interface DateSearchOption {
  option: string;
  date?: Date;
}

@Component({
    selector: 'app-search-dictation',
    templateUrl: './search-dictation.page.html',
    styleUrls: ['./search-dictation.page.scss'],
    standalone: false
})
export class SearchDictationPage implements OnInit, OnDestroy {
  SEARCH_HISTORY_KEY = 'SEARCH_HISTORY_KEY';
  MAX_HISTORY = 10;
  readonly searchResultCap = DICTATION_SEARCH_MAX_RESULTS;

  inputForm: UntypedFormGroup;
  results: Dictation[];
  suitableStudentOptions = SuitableStudentOptions;
  typeOptions = [
    {value: 'Any', label: 'Any'},
    {value: 'Vocab', label: 'Word'},
    {value: 'Article', label: 'Sentence'},
  ];
  dateOptions = this.createDateOptions();
  history: String[] = [];
  filteredHistory: String[] = [];
  showHistory = false;
  suitableChipLabel = '';
  typeChipLabel = '';
  dateChipLabel = '';
  private langChange: Subscription;

  constructor(
    public formBuilder: UntypedFormBuilder,
    public dictationService: DictationService,
    public translateService: TranslateService,
    public storage: StorageService,
    public ionicComponentService: IonicComponentService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.createForm();
    this.refreshChipLabels();
    this.langChange = this.translateService.onLangChange.subscribe(() => this.refreshChipLabels());
  }

  ngOnDestroy() {
    this.langChange?.unsubscribe();
  }

  get keyword() { return this.inputForm.get('keyword'); }
  get minDate() { return this.inputForm.get('minDate'); }
  get creator() { return this.inputForm.get('creator'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }
  get type() { return this.inputForm.get('type'); }
  get source() { return Dictations.Source; }
  get noResults(): boolean {
    return Array.isArray(this.results) && this.results.length === 0;
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'keyword': new UntypedFormControl('', [Validators.pattern('.{3,}|[0-9]{1,}'), Validators.maxLength(50)]),
      'minDate': this.dateOptions[0],
      'creator': new UntypedFormControl('', [Validators.minLength(3), Validators.maxLength(50)]),
      'suitableStudent': 'Any',
      'type': 'Any',
    });
    this.inputForm.get('suitableStudent').setValue('Any');
  }

  ionViewDidEnter() {
    this.storage.get(this.SEARCH_HISTORY_KEY).then(h => {
      this.history = h ? h : [];
    });
  }

  chooseSuitable(state: string) {
    this.suitableStudent.setValue(state);
    this.refreshChipLabels();
  }

  chooseType(value: string) {
    this.type.setValue(value);
    this.refreshChipLabels();
  }

  chooseDate(option: DateSearchOption) {
    this.minDate.setValue(option);
    this.refreshChipLabels();
  }

  private refreshChipLabels() {
    this.suitableChipLabel = this.translateService.instant('SuitableStudent.' + this.suitableStudent.value);
    const typeKey = this.typeOptions.find(option => option.value === this.type.value)?.label ?? '';
    this.typeChipLabel = typeKey ? this.translateService.instant(typeKey) : '';
    const dateKey = this.minDate.value?.option ?? '';
    this.dateChipLabel = dateKey ? this.translateService.instant(dateKey) : '';
    // The dev-mode double check skips this view, then fails when it re-reads the new label.
    this.cdr.markForCheck();
  }

  searchOnEnter(event: Event) {
    event.preventDefault();
    if (this.inputForm.invalid) {
      return;
    }
    void this.search();
  }

  clearSearch() {
    this.keyword.setValue('');
    this.creator.setValue('');
    this.suitableStudent.setValue('Any');
    this.type.setValue('Any');
    this.minDate.setValue(this.dateOptions[0]);
    this.refreshChipLabels();
    this.inputForm.markAsPristine();
    this.inputForm.markAsUntouched();
    this.showHistory = false;
    this.filteredHistory = [];
    this.results = null;
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
