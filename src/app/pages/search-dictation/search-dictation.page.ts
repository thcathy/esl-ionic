import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
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

interface SearchLink {
  q: string;
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
  /** Last q / suitable / type taken from the URL or committed by search or clear. */
  private appliedLink: SearchLink | null = null;
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

  ionViewWillEnter() {
    void this.applyRouteQuery();
  }

  ionViewDidEnter() {
    void this.ensureHistory();
  }

  chooseSuitable(state: string) {
    this.suitableStudent.setValue(state);
    this.refreshChipLabels();
    this.replaceQueryParams(false);
  }

  chooseType(value: string) {
    this.type.setValue(value);
    this.refreshChipLabels();
    this.replaceQueryParams(false);
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
    this.rememberLink(true);
  }

  async search() {
    const trimmed = `${this.keyword.value ?? ''}`.trim();
    if (this.keyword.value !== trimmed) {
      this.keyword.setValue(trimmed);
    }
    this.rememberLink(true);
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
      const incoming = this.routeLink();
      // Same URL on the way back from a dictation: keep the list and its page.
      if (this.appliedLink && this.sameLink(incoming, this.appliedLink)) {
        return;
      }

      const hadLink = this.appliedLink !== null;
      this.keyword.setValue(incoming.q);
      this.suitableStudent.setValue(incoming.suitable);
      this.type.setValue(incoming.type);
      this.creator.setValue('');
      this.minDate.setValue(this.dateOptions[0]);
      this.refreshChipLabels();
      this.showHistory = false;
      this.filteredHistory = [];
      this.rememberLink(true);

      if (!this.inputForm.valid) {
        this.keyword.markAsDirty();
        this.keyword.markAsTouched();
        this.results = null;
        return;
      }
      if (!this.hasCriteria(incoming)) {
        if (hadLink) {
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
      minDate: this.minDate.value.date,
      creator: this.creator.value,
      suitableStudent: this.suitableStudent.value,
      type: this.type.value === 'Any' ? null : this.type.value,
    }).subscribe(r => {
      loader.dismiss();
      this.results = r;
    }, _e => loader.dismiss());
  }

  private routeLink(): SearchLink {
    const params = this.route.snapshot.queryParamMap;
    return this.toLink(params.get('q'), params.get('suitable'), params.get('type'));
  }

  private formLink(): SearchLink {
    return this.toLink(this.keyword.value, this.suitableStudent.value, this.type.value);
  }

  private toLink(q: string | null, suitable: string | null, type: string | null): SearchLink {
    return {
      q: (q ?? '').trim(),
      suitable: suitable && this.suitableStudentOptions.includes(suitable) ? suitable : 'Any',
      type: type && this.typeOptions.some(option => option.value === type) ? type : 'Any',
    };
  }

  private sameLink(left: SearchLink, right: SearchLink): boolean {
    return left.q === right.q && left.suitable === right.suitable && left.type === right.type;
  }

  private hasCriteria(link: SearchLink): boolean {
    return link.q.length > 0 || link.suitable !== 'Any' || link.type !== 'Any';
  }

  private rememberLink(commitKeyword: boolean) {
    this.appliedLink = this.formLink();
    this.replaceQueryParams(commitKeyword);
  }

  private replaceQueryParams(commitKeyword: boolean) {
    const link = this.formLink();
    const queryParams: { q?: string | null; suitable: string | null; type: string | null } = {
      suitable: link.suitable === 'Any' ? null : link.suitable,
      type: link.type === 'Any' ? null : link.type,
    };
    if (commitKeyword) {
      queryParams.q = link.q.length > 0 ? link.q : null;
    }
    if (this.queryMatches(queryParams, commitKeyword)) {
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

  private queryMatches(
    next: { q?: string | null; suitable: string | null; type: string | null },
    includeKeyword: boolean,
  ): boolean {
    const current = this.route.snapshot.queryParamMap;
    const same = (key: string, expected: string | null) => {
      const actual = current.get(key);
      const normalized = actual == null || actual === '' ? null : actual;
      return normalized === expected;
    };
    if (includeKeyword && !same('q', next.q ?? null)) {
      return false;
    }
    return same('suitable', next.suitable) && same('type', next.type);
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
