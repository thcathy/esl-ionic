import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';

import {SearchDictationPage} from './search-dictation.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {ManageVocabHistoryServiceSpy, StorageSpy} from '../../../testing/mocks-ionic';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {StorageService} from '../../services/storage.service';
import {Dictation} from '../../entity/dictation';
import {DICTATION_SEARCH_MAX_RESULTS} from '../../services/dictation/dictation.service';
import {TestData} from '../../../testing/test-data';
import en from '../../../assets/i18n/en.json';

describe('SearchDictationPage', () => {
  let component: SearchDictationPage;
  let fixture: ComponentFixture<SearchDictationPage>;
  let storageSpy;

  beforeEach(waitForAsync(() => {
    storageSpy = StorageSpy();
    storageSpy.get.and.returnValue(Promise.resolve(['old search history']));

    TestBed.configureTestingModule({
      declarations: [ SearchDictationPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StorageService, useValue: storageSpy },
        { provide: ManageVocabHistoryService, useValue: ManageVocabHistoryServiceSpy},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
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


  it('history is loaded from storage when view enters, and updated when search', fakeAsync(() => {
    component.ionViewDidEnter();
    tick();
    expect(component.history[0]).toBe('old search history');

    component.keyword.setValue('new search');
    component.search();
    tick();
    expect(component.history.length).toBe(2);
    expect(component.history[0]).toBe('new search');
    expect(storageSpy.set.calls.mostRecent().args[1][0]).toEqual('new search');
  }));

  it('keep last 10 history at max', fakeAsync(() => {
    for (let i = 0; i < 15; i++) {
      component.keyword.setValue(`new search ${i}`);
      component.search();
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
    expect(fixture.nativeElement.querySelectorAll('.filter-chip').length).toBe(3);
    expect(chipText('suitable')).toBe('Suitable (Age): SuitableStudent.Any');
    expect(chipText('type')).toBe('Type: Any');
    expect(chipText('date')).toBe('Date: Any');
    expect(fixture.nativeElement.querySelector('ion-popover[trigger="suitable-filter"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-popover[trigger="type-filter"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-popover[trigger="date-filter"]')).toBeTruthy();
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
    expect(component.minDate.value).toBe(component.dateOptions[2]);
    expect(chipText('date')).toBe('Date: Within 3 Month');
    expect(search).not.toHaveBeenCalled();
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

  it('do not store duplicate search history', fakeAsync(() => {
    component.keyword.setValue(`new search`);
    component.search();
    tick();
    component.search();
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
    component.search();
    tick();
    fixture.detectChanges();
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

  function resultSummary(): string {
    return fixture.nativeElement.querySelector('[data-result-summary]')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  }

  function isPageDisabled(which: 'previous' | 'next'): boolean {
    const button = fixture.debugElement.query(By.css(`[data-page="${which}"]`));
    return button.componentInstance.disabled === true || button.nativeElement.disabled === true;
  }
});
