import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ActivatedRoute, convertToParamMap, Params, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {of, Subject} from 'rxjs';

import {SearchDictationPage} from './search-dictation.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {ManageVocabHistoryServiceSpy, StorageSpy} from '../../../testing/mocks-ionic';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {StorageService} from '../../services/storage.service';
import {Dictation} from '../../entity/dictation';
import {AnalyticsService} from '../../services/analytics.service';
import {DICTATION_SEARCH_MAX_RESULTS} from '../../services/dictation/dictation.service';
import {TestData} from '../../../testing/test-data';
import en from '../../../assets/i18n/en.json';

class SearchQueryRoute {
  query: Params = {};
  get snapshot() {
    return { queryParamMap: convertToParamMap(this.query) };
  }
}

describe('SearchDictationPage', () => {
  let component: SearchDictationPage;
  let fixture: ComponentFixture<SearchDictationPage>;
  let storageSpy;
  let queryRoute: SearchQueryRoute;
  let navigateSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    storageSpy = StorageSpy();
    storageSpy.get.and.returnValue(Promise.resolve(['old search history']));
    queryRoute = new SearchQueryRoute();

    TestBed.configureTestingModule({
      declarations: [ SearchDictationPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StorageService, useValue: storageSpy },
        { provide: ManageVocabHistoryService, useValue: ManageVocabHistoryServiceSpy},
        { provide: ActivatedRoute, useValue: queryRoute },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(SearchDictationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeDefined();
    expect(component.inputForm).toBeDefined();
  });

  it('form is validated', () => {
    component.keyword.setValue('ab');
    expect(component.keyword.errors.pattern).toBeDefined();
    component.keyword.setValue('abc');
    expect(component.keyword.errors).toBeNull();
    component.keyword.setValue('1');
    expect(component.keyword.errors).toBeNull();
    component.keyword.setValue('123456789012345678901234567890123456789012345678901');
    expect(component.keyword.errors.maxlength).toBeDefined();

    component.creator.setValue('12');
    expect(component.creator.errors.minlength).toBeDefined();
    component.creator.setValue('123456789012345678901234567890123456789012345678901');
    expect(component.creator.errors.maxlength).toBeDefined();
  });

  it('should create date options with controlled time', fakeAsync(() => {
    jasmine.clock().install();
    const baseTime = new Date(2023, 5, 15); // June 15, 2023
    jasmine.clock().mockDate(baseTime);

    const options = component.createDateOptions();
    expect(options[1].option).toBe('Within 1 Month');
    expect(options[1].date.getMonth()).toBe(4); // May
    expect(options[2].option).toBe('Within 3 Month');
    expect(options[2].date.getMonth()).toBe(2); // March
    expect(options[3].option).toBe('Within Half Year');
    expect(options[3].date.getMonth()).toBe(11); // December of previous year
    jasmine.clock().uninstall();
  }));


  it('reports result count and query length without the query text', fakeAsync(() => {
    const analytics = TestBed.inject(AnalyticsService);
    const searchUse = spyOn(analytics, 'searchUse');
    spyOn(component.dictationService, 'search').and.returnValue(of([{}, {}] as Dictation[]));
    const query = '  pupil@school.edu.hk  ';
    component.keyword.setValue(query);
    component.submitSearch();
    tick();

    expect(searchUse).toHaveBeenCalledOnceWith(2, 'pupil@school.edu.hk'.length);
    expect(JSON.stringify(searchUse.calls.mostRecent().args)).not.toContain('pupil');
    expect(JSON.stringify(searchUse.calls.mostRecent().args)).not.toContain('@');
  }));

  it('history is loaded from storage when view enters, and updated when search', fakeAsync(() => {
    component.ionViewDidEnter();
    tick();
    expect(component.history[0]).toBe('old search history');

    component.keyword.setValue('new search');
    component.submitSearch();
    tick();
    expect(component.history.length).toBe(2);
    expect(component.history[0]).toBe('new search');
    expect(storageSpy.set.calls.mostRecent().args[1][0]).toEqual('new search');
  }));

  it('keep last 10 history at max', fakeAsync(() => {
    spyOn(component.dictationService, 'search').and.returnValue(of([]));
    for (let i = 0; i < 15; i++) {
      component.keyword.setValue(`new search ${i}`);
      component.submitSearch();
      tick();
    }
    expect(component.history.length).toBe(10);
    expect(storageSpy.set.calls.mostRecent().args[1].length).toEqual(10);
  }));

  it('showHistory only contain history which is started with input keyword', () => {
    spyOn(component.dictationService, 'search');
    component.history = ['apple', 'banana', 'await'];
    component.keyword.setValue('a');
    component.filterHistory(null);

    expect(component.filteredHistory.length).toBe(2);
    expect(component.filteredHistory[0]).toBe('apple');
    expect(component.filteredHistory[1]).toBe('await');
    expect(component.dictationService.search).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.autocomplete ion-item').length).toBe(2);
  });

  it('uses the short keyword placeholder', () => {
    const keyword = fixture.nativeElement.querySelector('ion-input[formcontrolname="keyword"]');
    expect(keyword.label).toBe('Search');
    expect(keyword.placeholder).toBe('Title, words, or ID');
  });

  it('Enter searches only when the form is valid', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([]));
    const keywordInput = fixture.debugElement.query(By.css('ion-input[formcontrolname="keyword"]'));

    component.keyword.setValue('ab');
    fixture.detectChanges();
    keywordInput.triggerEventHandler('keydown.enter', new KeyboardEvent('keydown', {key: 'Enter'}));
    tick();
    expect(search).not.toHaveBeenCalled();
    expect(component.results).toBeUndefined();

    for (const value of ['abc', '1', '']) {
      search.calls.reset();
      component.keyword.setValue(value);
      fixture.detectChanges();
      keywordInput.triggerEventHandler('keydown.enter', new KeyboardEvent('keydown', {key: 'Enter'}));
      tick();
      expect(search).toHaveBeenCalled();
    }
  }));

  it('shows Created By without a More Options toggle', () => {
    expect(fixture.nativeElement.textContent).not.toContain('More Options');
    const creator = fixture.nativeElement.querySelector('ion-input[formcontrolname="creator"]');
    const filters = fixture.nativeElement.querySelector('.filters');
    expect(creator).toBeTruthy();
    expect(creator.compareDocumentPosition(filters) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows the active option as a chip and chooses it from a popover', () => {
    const search = spyOn(component.dictationService, 'search');
    expect(fixture.nativeElement.querySelectorAll('.filter-chip').length).toBe(4);
    expect(chipText('suitable')).toBe('Suitable (Age): SuitableStudent.Any');
    expect(chipText('type')).toBe('Type: Any');
    expect(chipText('date')).toBe('Date: Any');
    expect(chipText('sort')).toBe('Sort: SearchSort.newest');
    expect(fixture.nativeElement.querySelector('ion-popover[trigger="suitable-filter"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-popover[trigger="type-filter"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-popover[trigger="date-filter"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-popover[trigger="sort-filter"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-select')).toBeNull();
    expect(fixture.nativeElement.querySelector('.filter-choices')).toBeNull();

    component.chooseType('Vocab');
    fixture.detectChanges();
    expect(component.type.value).toBe('Vocab');
    expect(chipText('type')).toBe('Type: Word');

    component.chooseSuitable('JuniorPrimary');
    fixture.detectChanges();
    expect(component.suitableStudent.value).toBe('JuniorPrimary');
    expect(chipText('suitable')).toBe('Suitable (Age): SuitableStudent.JuniorPrimary');

    component.chooseDate(component.dateOptions[2]);
    fixture.detectChanges();
    expect(component.date.value).toBe(component.dateOptions[2]);
    expect(chipText('date')).toBe('Date: Within 3 Month');

    component.chooseSort('mostPracticed');
    fixture.detectChanges();
    expect(component.sort.value).toBe('mostPracticed');
    expect(chipText('sort')).toBe('Sort: SearchSort.mostPracticed');
    expect(search).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledTimes(3);
    const lastParams = navigateSpy.calls.mostRecent().args[1].queryParams;
    expect(lastParams).toEqual({ sort: 'mostPracticed' });
    expect(navigateSpy.calls.argsFor(1)[1].queryParams).toEqual({ suitable: 'JuniorPrimary', type: 'Vocab' });
    expect(navigateSpy.calls.mostRecent().args[1].replaceUrl).toBeTrue();
    expect(navigateSpy.calls.mostRecent().args[1].queryParamsHandling).toBe('merge');
  });

  function chipText(group: string): string {
    return fixture.nativeElement.querySelector(`[data-filter="${group}"]`).textContent.replace(/\s+/g, ' ').trim();
  }

  it('shows the 3-character message for a too-short keyword', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      CharactersTooShort: 'cannot less than {{length}} characters',
    });
    translate.use('en');

    component.keyword.setValue('ab');
    component.keyword.markAsDirty();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error-text').textContent)
      .toContain('cannot less than 3 characters');

    component.history = ['apple'];
    component.filterHistory(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.autocomplete')).toBeNull();
    expect(fixture.nativeElement.querySelector('.error-text').textContent)
      .toContain('cannot less than 3 characters');
  });

  it('says no dictation matched when the search has no hits', fakeAsync(() => {
    useNoResultsCopy();
    spyOn(component.dictationService, 'search').and.returnValue(of([]));
    component.keyword.setValue('apple');
    component.chooseSuitable('JuniorPrimary');
    component.chooseType('Vocab');
    component.chooseDate(component.dateOptions[2]);
    runSearch();

    expect(noResultsMessage()).toBe('No dictation matched.');
    expect(fixture.nativeElement.querySelector('.no-results-filters')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-action="clear-search"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-dictation-list')).toBeNull();
  }));

  it('clear resets the keyword and filters and leaves the empty state', fakeAsync(() => {
    useNoResultsCopy();
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([]));
    component.keyword.setValue('apple');
    component.creator.setValue('ann');
    component.chooseSuitable('JuniorPrimary');
    component.chooseType('Vocab');
    component.chooseDate(component.dateOptions[2]);
    component.sort.setValue('mostRecommended');
    component.history = ['apple pie'];
    component.filterHistory(null);
    runSearch();
    search.calls.reset();

    fixture.debugElement.query(By.css('[data-action="clear-search"]')).triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.keyword.value).toBe('');
    expect(component.creator.value).toBe('');
    expect(chipText('suitable')).toBe('Suitable (Age): Any');
    expect(chipText('type')).toBe('Type: Any');
    expect(chipText('date')).toBe('Date: Any');
    expect(chipText('sort')).toBe('Sort: Newest');
    expect(fixture.nativeElement.querySelector('.no-results')).toBeNull();
    expect(fixture.nativeElement.querySelector('.autocomplete')).toBeNull();
    expect(search).not.toHaveBeenCalled();
  }));

  it('shows how many matched and pages with Previous and Next', fakeAsync(() => {
    useNoResultsCopy();
    spyOn(component.dictationService, 'search').and.returnValue(of(searchHits(23)));
    component.keyword.setValue('apple');
    runSearch();

    expect(resultSummary()).toBe('1\u20135 of 23');
    expect(isPageDisabled('previous')).toBeTrue();
    expect(isPageDisabled('next')).toBeFalse();
    expect(fixture.nativeElement.textContent).not.toContain('Older');
    expect(fixture.nativeElement.textContent).not.toContain('Newer');

    fixture.debugElement.query(By.css('[data-page="next"]')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(resultSummary()).toBe('6\u201310 of 23');
    expect(isPageDisabled('previous')).toBeFalse();
  }));

  it('counts a single page of matches', fakeAsync(() => {
    useNoResultsCopy();
    spyOn(component.dictationService, 'search').and.returnValue(of(searchHits(3)));
    component.keyword.setValue('apple');
    runSearch();

    expect(resultSummary()).toBe('1\u20133 of 3');
    expect(isPageDisabled('previous')).toBeTrue();
    expect(isPageDisabled('next')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.no-results')).toBeNull();
  }));

  it('says the search cap was hit when 50 dictations come back', fakeAsync(() => {
    useNoResultsCopy();
    spyOn(component.dictationService, 'search').and.returnValue(of(searchHits(DICTATION_SEARCH_MAX_RESULTS)));
    component.keyword.setValue('apple');
    runSearch();

    expect(resultSummary()).toBe(`1\u20135 of ${DICTATION_SEARCH_MAX_RESULTS}+`);
    expect(isPageDisabled('next')).toBeFalse();
  }));

  it('shows matching dictations instead of the empty state', fakeAsync(() => {
    useNoResultsCopy();
    spyOn(component.dictationService, 'search').and.returnValue(of([TestData.fillInDictation()]));
    component.keyword.setValue('apple');
    runSearch();

    expect(fixture.nativeElement.querySelector('.no-results')).toBeNull();
    expect(fixture.nativeElement.querySelector('#dictation-list ion-item')).toBeTruthy();
  }));

  it('loads q, suitable, and type from the URL and searches', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([TestData.fillInDictation()]));
    component.creator.setValue('ann');
    component.chooseDate(component.dateOptions[2]);
    queryRoute.query = { q: ' apple ', suitable: 'JuniorPrimary', type: 'Vocab', sort: 'new' };
    openFromUrl();

    expect(component.keyword.value).toBe('apple');
    expect(component.suitableStudent.value).toBe('JuniorPrimary');
    expect(component.type.value).toBe('Vocab');
    expect(component.creator.value).toBe('');
    expect(component.date.value).toBe(component.dateOptions[0]);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      keyword: 'apple',
      suitableStudent: 'JuniorPrimary',
      type: 'Vocab',
      creator: '',
    }));
    expect(search.calls.mostRecent().args[0].minDate).toBeUndefined();
    expect(search.calls.mostRecent().args[0].sort).toBe('newest');
    expect(component.sort.value).toBe('newest');
    expect(component.history[0]).toBe('apple');
    expect(component.history[1]).toBe('old search history');
    expect(navigateSpy).toHaveBeenCalledWith([], jasmine.objectContaining({
      replaceUrl: true,
      queryParamsHandling: 'merge',
      queryParams: { suitable: 'JuniorPrimary', type: 'Vocab', q: 'apple', sort: null },
    }));
    fixture.detectChanges();
    expect(chipText('suitable')).toBe('Suitable (Age): SuitableStudent.JuniorPrimary');
    expect(chipText('type')).toBe('Type: Word');

    const results = component.results;
    openFromUrl();
    expect(search).toHaveBeenCalledTimes(1);
    expect(component.results).toBe(results);
  }));

  it('drops unknown suitable and type and skips a blank search', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([]));
    queryRoute.query = { q: '  ', suitable: 'nope', type: 'Sentence' };
    openFromUrl();

    expect(component.keyword.value).toBe('');
    expect(component.suitableStudent.value).toBe('Any');
    expect(component.type.value).toBe('Any');
    expect(search).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith([], jasmine.objectContaining({
      replaceUrl: true,
      queryParamsHandling: 'merge',
      queryParams: { q: null, suitable: null, type: null, sort: null },
    }));
  }));

  it('shows the keyword error and does not search a too-short q', fakeAsync(() => {
    useNoResultsCopy();
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([]));
    queryRoute.query = { q: 'ab', suitable: 'nope' };
    openFromUrl();
    fixture.detectChanges();

    expect(search).not.toHaveBeenCalled();
    expect(component.keyword.errors.pattern).toBeDefined();
    expect(component.suitableStudent.value).toBe('Any');
    expect(fixture.nativeElement.querySelector('.error-text').textContent)
      .toContain('cannot less than 3 characters');
    expect(navigateSpy).toHaveBeenCalledWith([], jasmine.objectContaining({
      replaceUrl: true,
      queryParams: { q: 'ab', suitable: null, type: null, sort: null },
    }));
  }));

  it('writes q, suitable, type, and sort when search runs', fakeAsync(() => {
    spyOn(component.dictationService, 'search').and.returnValue(of([]));
    component.keyword.setValue(' apple ');
    component.chooseSuitable('JuniorPrimary');
    component.chooseType('Article');
    navigateSpy.calls.reset();
    runSearch();

    expect(component.keyword.value).toBe('apple');
    expect(navigateSpy).toHaveBeenCalledWith([], jasmine.objectContaining({
      replaceUrl: true,
      queryParamsHandling: 'merge',
      queryParams: { q: 'apple', suitable: 'JuniorPrimary', type: 'Article', sort: null },
    }));
  }));

  it('clears q, suitable, type, and sort from the URL', () => {
    component.keyword.setValue('apple');
    component.chooseType('Vocab');
    component.sort.setValue('lastModified');
    queryRoute.query = { q: 'apple', type: 'Vocab', sort: 'lastModified' };
    navigateSpy.calls.reset();

    component.clearSearch();

    expect(component.sort.value).toBe('newest');
    expect(navigateSpy).toHaveBeenCalledWith([], jasmine.objectContaining({
      replaceUrl: true,
      queryParamsHandling: 'merge',
      queryParams: { q: null, suitable: null, type: null, sort: null },
    }));
  });

  it('does not store a blank keyword for a filter-only link', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([]));
    queryRoute.query = { type: 'Vocab' };
    openFromUrl();

    expect(search).toHaveBeenCalledTimes(1);
    expect(search.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      keyword: '',
      type: 'Vocab',
    }));
    expect(search.calls.mostRecent().args[0].sort).toBe('newest');
    expect(component.history).toEqual(['old search history']);
  }));

  it('keeps the current list until Search, then uses the server order', fakeAsync(() => {
    const practicedFirst = TestData.fillInDictation();
    practicedFirst.id = 11;
    practicedFirst.title = 'Practiced first';
    practicedFirst.createdDate = new Date('2020-01-01');
    practicedFirst.totalAttempt = 40;
    practicedFirst.totalRecommended = 1;
    const createdLater = TestData.fillInDictation();
    createdLater.id = 22;
    createdLater.title = 'Created later';
    createdLater.createdDate = new Date('2024-06-01');
    createdLater.totalAttempt = 2;
    createdLater.totalRecommended = 9;
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([practicedFirst, createdLater]));

    component.keyword.setValue('apple');
    component.chooseSort('mostPracticed');

    expect(search).not.toHaveBeenCalled();
    expect(component.results).toBeUndefined();
    expect(navigateSpy).toHaveBeenCalledWith([], jasmine.objectContaining({
      replaceUrl: true,
      queryParamsHandling: 'merge',
      queryParams: { sort: 'mostPracticed' },
    }));

    runSearch();
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.calls.mostRecent().args[0].sort).toBe('mostPracticed');
    expect(component.results.map(item => item.id)).toEqual([11, 22]);
    expect(headings()).toEqual(['Practiced first', 'Created later']);

    search.and.returnValue(of([createdLater, practicedFirst]));
    component.chooseSort('newest');
    expect(search).toHaveBeenCalledTimes(1);
    expect(component.results.map(item => item.id)).toEqual([11, 22]);

    runSearch();
    expect(search).toHaveBeenCalledTimes(2);
    expect(search.calls.mostRecent().args[0].sort).toBe('newest');
    expect(component.results.map(item => item.id)).toEqual([22, 11]);
    expect(headings()).toEqual(['Created later', 'Practiced first']);
  }));

  it('does not start a second search while one is running', fakeAsync(() => {
    const first = new Subject<Dictation[]>();
    const search = spyOn(component.dictationService, 'search').and.returnValue(first.asObservable());
    const kept = TestData.fillInDictation();
    kept.title = 'Kept';

    component.keyword.setValue('apple');
    component.submitSearch();
    tick();
    component.keyword.setValue('banana');
    component.submitSearch();
    tick();

    expect(search).toHaveBeenCalledTimes(1);
    expect(search.calls.mostRecent().args[0].keyword).toBe('apple');
    expect(component.searchInFlight).toBeTrue();
    first.next([kept]);
    expect(component.results.map(item => item.title)).toEqual(['Kept']);
    expect(component.searchInFlight).toBeFalse();
  }));

  it('loads sort from the URL and searches with that value', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([TestData.fillInDictation()]));
    queryRoute.query = { q: 'apple', sort: 'lastModified' };
    openFromUrl();
    fixture.detectChanges();

    expect(component.sort.value).toBe('lastModified');
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.calls.mostRecent().args[0].sort).toBe('lastModified');
    expect(chipText('sort')).toBe('Sort: SearchSort.lastModified');
    expect(navigateSpy).not.toHaveBeenCalled();

    const results = component.results;
    openFromUrl();
    expect(search).toHaveBeenCalledTimes(1);
    expect(component.results).toBe(results);
  }));

  it('treats an unknown sort as newest and drops it from the URL', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([TestData.fillInDictation()]));
    queryRoute.query = { q: 'apple', sort: 'highestRated' };
    openFromUrl();

    expect(component.sort.value).toBe('newest');
    expect(search.calls.mostRecent().args[0].sort).toBe('newest');
    expect(navigateSpy).toHaveBeenCalledWith([], jasmine.objectContaining({
      replaceUrl: true,
      queryParamsHandling: 'merge',
      queryParams: { q: 'apple', suitable: null, type: null, sort: null },
    }));
  }));

  it('searches when the link only sets sort', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([TestData.fillInDictation()]));
    queryRoute.query = { sort: 'mostRecommended' };
    openFromUrl();

    expect(search).toHaveBeenCalledTimes(1);
    expect(search.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      keyword: '',
      sort: 'mostRecommended',
    }));
    expect(component.history).toEqual(['old search history']);
    expect(navigateSpy).not.toHaveBeenCalled();
  }));

  it('writes sort without searching when the keyword is too short', () => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([]));
    component.keyword.setValue('ab');
    component.chooseSort('mostPracticed');

    expect(search).not.toHaveBeenCalled();
    expect(component.sort.value).toBe('mostPracticed');
    expect(navigateSpy).toHaveBeenCalledWith([], jasmine.objectContaining({
      replaceUrl: true,
      queryParamsHandling: 'merge',
      queryParams: { sort: 'mostPracticed' },
    }));
  });

  it('searches again when the URL sort changes', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([TestData.fillInDictation()]));
    queryRoute.query = { q: 'apple', sort: 'mostPracticed' };
    openFromUrl();

    queryRoute.query = { q: 'apple', sort: 'mostRecommended' };
    openFromUrl();

    expect(search).toHaveBeenCalledTimes(2);
    expect(search.calls.mostRecent().args[0].sort).toBe('mostRecommended');
    expect(component.sort.value).toBe('mostRecommended');
  }));

  it('searches the updated URL when a chip changed before leaving', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([TestData.fillInDictation()]));
    queryRoute.query = { q: 'apple' };
    openFromUrl();

    component.chooseType('Article');
    queryRoute.query = { q: 'apple', type: 'Article' };
    openFromUrl();

    expect(search).toHaveBeenCalledTimes(2);
    expect(search.calls.mostRecent().args[0].type).toBe('Article');
    expect(component.type.value).toBe('Article');
  }));

  it('a later visit with no params clears a previous filtered search', fakeAsync(() => {
    const search = spyOn(component.dictationService, 'search').and.returnValue(of([TestData.fillInDictation()]));
    queryRoute.query = { q: 'apple' };
    openFromUrl();
    expect(search).toHaveBeenCalledTimes(1);

    queryRoute.query = {};
    openFromUrl();
    expect(component.keyword.value).toBe('');
    expect(component.results).toBeNull();
    expect(search).toHaveBeenCalledTimes(1);
  }));

  it('do not store duplicate search history', fakeAsync(() => {
    spyOn(component.dictationService, 'search').and.returnValue(of([]));
    component.keyword.setValue(`new search`);
    component.submitSearch();
    tick();
    component.submitSearch();
    tick();

    expect(component.history.length).toBe(1);
    expect(component.history[0]).toBe('new search');
  }));

  function useNoResultsCopy() {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en, true);
    translate.use('en');
  }

  function runSearch() {
    component.submitSearch();
    tick();
    fixture.detectChanges();
  }

  function openFromUrl() {
    component.ionViewWillEnter();
    tick();
  }

  function noResultsMessage(): string {
    return fixture.nativeElement.querySelector('.no-results-message')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  }

  function searchHits(count: number): Dictation[] {
    return Array.from({length: count}, (_, index) => {
      const dictation = TestData.fillInDictation();
      dictation.id = index + 1;
      dictation.title = `Dictation ${index + 1}`;
      return dictation;
    });
  }

  function headings(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('#dictation-list .heading'), (node: Element) => node.textContent.trim());
  }

  function resultSummary(): string {
    return fixture.nativeElement.querySelector('[data-result-summary]')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  }

  function isPageDisabled(which: 'previous' | 'next'): boolean {
    const button = fixture.debugElement.query(By.css(`[data-page="${which}"]`));
    return button.componentInstance.disabled === true || button.nativeElement.disabled === true;
  }
});
