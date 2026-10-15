import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Dictation, SuitableStudentOptions} from '../../entity/dictation';
import {
  DICTATION_SEARCH_MAX_RESULTS,
  DICTATION_SEARCH_SORTS,
  DictationSearchSort,
  DictationService,
  isDictationSearchSort,
  SearchDictationRequest,
} from '../../services/dictation/dictation.service';
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
  sort: DictationSearchSort;
}

type SearchLinkParams = Partial<Record<'q' | 'suitable' | 'type' | 'sort', string | null>>;

@Component({
    selector: 'app-search-dictation',
    templateUrl: './search-dictation.page.html',
    styleUrls: ['./search-dictation.page.scss'],
    standalone: false
})
export class SearchDictationPage implements OnInit, OnDestroy {
  private static readonly blankQuery: SearchQuery = {
    keyword: '',
    suitable: 'Any',
    type: 'Any',
    sort: 'newest',
  };

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
  readonly sortOptions = DICTATION_SEARCH_SORTS;
  dateOptions = this.createDateOptions();
  history: String[] = [];
  filteredHistory: String[] = [];
  showHistory = false;
  suitableChipLabel = '';
  typeChipLabel = '';
  dateChipLabel = '';
  sortChipLabel = '';
  private langChange: Subscription;
  private historyReady: Promise<void> | null = null;
  /** q / suitable / type / sort last read from or written to the URL. */
  private query: SearchQuery | null = null;
  private applyingQuery = false;
  searchInFlight = false;

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
  get sort() { return this.inputForm.get('sort'); }
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
      'sort': 'newest',
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

  chooseSort(value: DictationSearchSort) {
    if (this.sort.value === value) {
      return;
    }
    this.sort.setValue(value);
    this.refreshChipLabels();
    const {sort} = this.urlParams(this.queryFromForm());
    this.replaceUrl({sort});
  }

  private refreshChipLabels() {
    this.suitableChipLabel = this.translateService.instant('SuitableStudent.' + this.suitableStudent.value);
    const typeKey = this.typeOptions.find(option => option.value === this.type.value)?.label ?? '';
    this.typeChipLabel = typeKey ? this.translateService.instant(typeKey) : '';
    const dateKey = this.date.value?.option ?? '';
    this.dateChipLabel = dateKey ? this.translateService.instant(dateKey) : '';
    this.sortChipLabel = this.translateService.instant('SearchSort.' + this.sort.value);
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
    this.sort.setValue('newest');
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
    if (this.searchInFlight) {
      return;
    }
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
      this.sort.setValue(incoming.sort);
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
      if (this.sameQuery(incoming, SearchDictationPage.blankQuery)) {
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
    if (this.searchInFlight) {
      return;
    }
    this.searchInFlight = true;
    this.results = null;
    const loader = await this.ionicComponentService.showLoading();
    this.addToHistory(this.keyword.value);
    this.dictationService.search(this.searchRequest()).subscribe(results => {
      this.results = results;
      this.endSearch(loader);
    }, () => this.endSearch(loader));
  }

  private endSearch(loader: { dismiss: () => void }) {
    this.searchInFlight = false;
    void loader.dismiss();
    this.cdr.markForCheck();
  }

  private searchRequest(): SearchDictationRequest {
    const query = this.queryFromForm();
    const request: SearchDictationRequest = {
      keyword: this.keyword.value,
      minDate: this.date.value.date,
      creator: this.creator.value,
      suitableStudent: query.suitable,
      type: query.type === 'Any' ? null : query.type,
      sort: query.sort,
    };
    return request;
  }

  private queryFromUrl(): SearchQuery {
    const params = this.route.snapshot.queryParamMap;
    return this.toQuery(params.get('q'), params.get('suitable'), params.get('type'), params.get('sort'));
  }

  private queryFromForm(): SearchQuery {
    return this.toQuery(this.keyword.value, this.suitableStudent.value, this.type.value, this.sort.value);
  }

  private toQuery(keyword: string | null, suitable: string | null, type: string | null, sort: string | null): SearchQuery {
    return {
      keyword: (keyword ?? '').trim(),
      suitable: suitable && this.suitableStudentOptions.includes(suitable) ? suitable : 'Any',
      type: type && this.typeOptions.some(option => option.value === type) ? type : 'Any',
      sort: isDictationSearchSort(sort) ? sort : 'newest',
    };
  }

  private sameQuery(left: SearchQuery, right: SearchQuery): boolean {
    return left.keyword === right.keyword
      && left.suitable === right.suitable
      && left.type === right.type
      && left.sort === right.sort;
  }

  private saveQuery() {
    const query = this.queryFromForm();
    this.query = query;
    this.replaceUrl(this.urlParams(query));
  }

  private updateSuitableAndType() {
    const {suitable, type} = this.urlParams(this.queryFromForm());
    this.replaceUrl({suitable, type});
  }

  private urlParams(query: SearchQuery) {
    return {
      q: query.keyword.length > 0 ? query.keyword : null,
      suitable: query.suitable === 'Any' ? null : query.suitable,
      type: query.type === 'Any' ? null : query.type,
      sort: query.sort === 'newest' ? null : query.sort,
    };
  }

  private replaceUrl(queryParams: SearchLinkParams) {
    const current = (key: string) => this.route.snapshot.queryParamMap.get(key) || null;
    const keys = Object.keys(queryParams) as Array<keyof SearchLinkParams>;
    if (keys.every(key => current(key) === (queryParams[key] ?? null))) {
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
