import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Dictation, SuitableStudentOptions} from '../../entity/dictation';
import {DICTATION_SEARCH_MAX_RESULTS, DictationService} from '../../services/dictation/dictation.service';
import {ValidationUtils} from '../../utils/validation-utils';
import {IonicComponentService} from '../../services/ionic-component.service';
import {StorageService} from '../../services/storage.service';

export interface DateSearchOption {
  option: string;
  date?: Date;
}

interface SearchQuery {
  keyword: string;
  suitable: string;
  type: string;
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
  private historyReady: Promise<void> | null = null;
  /** q / suitable / type last read from or written to the URL. */
  private query: SearchQuery | null = null;
  private applyingQuery = false;

  constructor(
    public formBuilder: UntypedFormBuilder,
    public dictationService: DictationService,
    public translateService: TranslateService,
    public storage: StorageService,
    public ionicComponentService: IonicComponentService,
    private route: ActivatedRoute,
    private router: Router,
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
  get date() { return this.inputForm.get('date'); }
  get creator() { return this.inputForm.get('creator'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }
  get type() { return this.inputForm.get('type'); }
  get noResults(): boolean {
    return Array.isArray(this.results) && this.results.length === 0;
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'keyword': new UntypedFormControl('', [Validators.pattern('.{3,}|[0-9]{1,}'), Validators.maxLength(50)]),
      'date': this.dateOptions[0],
      'creator': new UntypedFormControl('', [Validators.minLength(3), Validators.maxLength(50)]),
      'suitableStudent': 'Any',
      'type': 'Any',
    });
    this.inputForm.get('suitableStudent').setValue('Any');
  }

  ionViewWillEnter() {
    void this.applyRouteQuery();
  }

  ionViewDidEnter() {
    void this.ensureHistory();
  }

  chooseSuitable(option: string) {
    this.suitableStudent.setValue(option);
    this.refreshChipLabels();
    this.updateSuitableAndType();
  }

  chooseType(value: string) {
    this.type.setValue(value);
    this.refreshChipLabels();
    this.updateSuitableAndType();
  }

  chooseDate(option: DateSearchOption) {
    this.date.setValue(option);
    this.refreshChipLabels();
  }

  private refreshChipLabels() {
    this.suitableChipLabel = this.translateService.instant('SuitableStudent.' + this.suitableStudent.value);
    const typeKey = this.typeOptions.find(option => option.value === this.type.value)?.label ?? '';
    this.typeChipLabel = typeKey ? this.translateService.instant(typeKey) : '';
    const dateKey = this.date.value?.option ?? '';
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
    this.date.setValue(this.dateOptions[0]);
    this.refreshChipLabels();
    this.inputForm.markAsPristine();
    this.inputForm.markAsUntouched();
    this.showHistory = false;
    this.filteredHistory = [];
    this.results = null;
    this.saveQuery();
  }

  async search() {
    const trimmed = `${this.keyword.value ?? ''}`.trim();
    if (this.keyword.value !== trimmed) {
      this.keyword.setValue(trimmed);
    }
    this.saveQuery();
    await this.fetchResults();
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

  private ensureHistory(): Promise<void> {
    if (!this.historyReady) {
      this.historyReady = this.storage.get(this.SEARCH_HISTORY_KEY).then(h => {
        this.history = h ? h : [];
      });
    }
    return this.historyReady;
  }

  private async applyRouteQuery(): Promise<void> {
    if (this.applyingQuery) {
      return;
    }
    this.applyingQuery = true;
    try {
      // History must be in memory before a search stores this keyword.
      await this.ensureHistory();
      const incoming = this.queryFromUrl();
      // Same URL on the way back from a dictation: keep the list and its page.
      if (this.query && this.sameQuery(incoming, this.query)) {
        return;
      }

      const hadQuery = this.query !== null;
      this.keyword.setValue(incoming.keyword);
      this.suitableStudent.setValue(incoming.suitable);
      this.type.setValue(incoming.type);
      this.creator.setValue('');
      this.date.setValue(this.dateOptions[0]);
      this.refreshChipLabels();
      this.showHistory = false;
      this.filteredHistory = [];
      this.saveQuery();

      if (!this.inputForm.valid) {
        this.keyword.markAsDirty();
        this.keyword.markAsTouched();
        this.results = null;
        return;
      }
      if (incoming.keyword.length === 0 && incoming.suitable === 'Any' && incoming.type === 'Any') {
        if (hadQuery) {
          this.results = null;
        }
        return;
      }
      await this.fetchResults();
    } finally {
      this.applyingQuery = false;
    }
  }

  private async fetchResults() {
    this.results = null;
    const loader = await this.ionicComponentService.showLoading();

    this.addToHistory(this.keyword.value);
    this.dictationService.search({
      keyword: this.keyword.value,
      minDate: this.date.value.date,
      creator: this.creator.value,
      suitableStudent: this.suitableStudent.value,
      type: this.type.value === 'Any' ? null : this.type.value,
    }).subscribe(r => {
      loader.dismiss();
      this.results = r;
    }, _e => loader.dismiss());
  }

  private queryFromUrl(): SearchQuery {
    const params = this.route.snapshot.queryParamMap;
    return this.toQuery(params.get('q'), params.get('suitable'), params.get('type'));
  }

  private queryFromForm(): SearchQuery {
    return this.toQuery(this.keyword.value, this.suitableStudent.value, this.type.value);
  }

  private toQuery(keyword: string | null, suitable: string | null, type: string | null): SearchQuery {
    return {
      keyword: (keyword ?? '').trim(),
      suitable: suitable && this.suitableStudentOptions.includes(suitable) ? suitable : 'Any',
      type: type && this.typeOptions.some(option => option.value === type) ? type : 'Any',
    };
  }

  private sameQuery(left: SearchQuery, right: SearchQuery): boolean {
    return left.keyword === right.keyword && left.suitable === right.suitable && left.type === right.type;
  }

  private saveQuery() {
    const query = this.queryFromForm();
    this.query = query;
    this.replaceUrl({
      q: query.keyword.length > 0 ? query.keyword : null,
      suitable: query.suitable === 'Any' ? null : query.suitable,
      type: query.type === 'Any' ? null : query.type,
    });
  }

  private updateSuitableAndType() {
    const query = this.queryFromForm();
    this.replaceUrl({
      suitable: query.suitable === 'Any' ? null : query.suitable,
      type: query.type === 'Any' ? null : query.type,
    });
  }

  private replaceUrl(queryParams: { q?: string | null; suitable: string | null; type: string | null }) {
    const param = (key: string) => this.route.snapshot.queryParamMap.get(key) || null;
    if ((!('q' in queryParams) || param('q') === (queryParams.q ?? null))
        && param('suitable') === queryParams.suitable
        && param('type') === queryParams.type) {
      return;
    }
    // Same-page query update. NavigationService.navigate would push a history entry.
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParamsHandling: 'merge',
      queryParams,
    });
  }

  private addToHistory(value: String) {
    const term = `${value ?? ''}`.trim();
    if (term.length === 0 || this.history.some(h => h == term)) {
      return;
    }

    this.history.unshift(term);
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
