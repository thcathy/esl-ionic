import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

import {SharedTestModule} from '../../../testing/shared-test.module';
import {TestData} from '../../../testing/test-data';
import {Dictation} from '../../entity/dictation';
import {DICTATION_SEARCH_MAX_RESULTS} from '../../services/dictation/dictation.service';
import en from '../../../assets/i18n/en.json';
import {DictationListComponent} from './dictation-list';

describe('DictationListComponent', () => {
  let component: DictationListComponent;
  let fixture: ComponentFixture<DictationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DictationListComponent ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationListComponent);
    component = fixture.componentInstance;
  });

  describe('dictations source are Select', () => {
    it('html elements display correctly', fakeAsync(() => {
      component.dictations = [TestData.selectDictation()];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('ion-col .recommended-col')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-row .suitable-student-row')).toBeNull();
    }));
  });

  it('view passes the dictation through when openById is off', () => {
    const dictation = TestData.fillInDictation();
    component.dictations = [dictation];
    component.ngOnChanges({});
    fixture.detectChanges();

    fixture.debugElement.query(By.css('#dictation-list ion-button')).triggerEventHandler('click', null);

    expect(component.navService.pushOpenDictation).toHaveBeenCalledWith(dictation);
    expect(component.navService.openDictationById).not.toHaveBeenCalled();
  });

  it('renders one preview line at the bottom of every row', () => {
    const described = TestData.fillInDictation();
    described.description = 'Fruit words';
    described.suitableStudent = 'Kindergarten';
    const article = new TestData.DefaultSentenceDictation();
    article.id = 2;
    article.description = '   ';
    article.article = 'The cat sat.';
    component.dictations = [described, article];
    component.ngOnChanges({});
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('#dictation-list ion-label');
    expect(labels.length).toBe(2);
    labels.forEach((label: HTMLElement) => {
      const previews = label.querySelectorAll('.preview-line');
      expect(previews.length).toBe(1);
      const heading = label.querySelector('.heading');
      expect(heading.compareDocumentPosition(previews[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(label.lastElementChild.classList.contains('preview-row')).toBeTrue();
    });
    expect(labels[0].querySelector('.preview-line').textContent.trim()).toBe('Fruit words');
    expect(labels[0].querySelector('.preview-line').getAttribute('title')).toBe('Fruit words');
    expect(labels[0].querySelector('.suitable-student-row')).not.toBeNull();
    expect(labels[0].innerHTML).toContain('3 Vocab(s)');
    expect(labels[1].querySelector('.preview-line').textContent.trim()).toBe('The cat sat.');
    expect(labels[1].innerHTML).toContain('1 Sentence');
  });

  describe('search result summary', () => {
    beforeEach(() => {
      const translate = TestBed.inject(TranslateService);
      translate.setTranslation('en', en, true);
      translate.use('en');
      component.showResultSummary = true;
      component.resultCap = DICTATION_SEARCH_MAX_RESULTS;
    });

    it('counts a normal multi-page result and disables Previous on the first page', () => {
      showDictations(23);

      expect(summaryText()).toBe('Showing 1\u20135 of 23');
      expect(buttonText('previous')).toBe('Previous');
      expect(buttonText('next')).toBe('Next');
      expect(isDisabled('previous')).toBeTrue();
      expect(isDisabled('next')).toBeFalse();
      expect(fixture.nativeElement.textContent).not.toContain('Older');
      expect(fixture.nativeElement.textContent).not.toContain('Newer');

      clickPage('previous');
      expect(summaryText()).toBe('Showing 1\u20135 of 23');

      clickPage('next');
      expect(summaryText()).toBe('Showing 6\u201310 of 23');
      expect(isDisabled('previous')).toBeFalse();
      expect(isDisabled('next')).toBeFalse();
    });

    it('counts a single page and disables both ends', () => {
      showDictations(3);

      expect(summaryText()).toBe('Showing 1\u20133 of 3');
      expect(isDisabled('previous')).toBeTrue();
      expect(isDisabled('next')).toBeTrue();
      expect(fixture.nativeElement.querySelectorAll('#dictation-list ion-item').length).toBe(3);
    });

    it('counts every match when the list is under the cap', () => {
      showDictations(DICTATION_SEARCH_MAX_RESULTS - 1);
      expect(summaryText()).toBe(`Showing 1\u20135 of ${DICTATION_SEARCH_MAX_RESULTS - 1}`);
      expect(fixture.nativeElement.textContent).not.toContain('+');
    });

    it('says the 50 cap was hit instead of an exact total', () => {
      showDictations(DICTATION_SEARCH_MAX_RESULTS);
      expect(summaryText()).toBe(`Showing 1\u20135 of ${DICTATION_SEARCH_MAX_RESULTS}+`);
      expect(isDisabled('previous')).toBeTrue();
      expect(isDisabled('next')).toBeFalse();

      for (let page = 0; page < 9; page++) {
        clickPage('next');
      }
      expect(summaryText()).toBe(`Showing 46\u201350 of ${DICTATION_SEARCH_MAX_RESULTS}+`);
      expect(isDisabled('next')).toBeTrue();
      expect(isDisabled('previous')).toBeFalse();
    });

    it('does not show a count when there are no rows', () => {
      showDictations(0);
      expect(fixture.nativeElement.querySelector('[data-result-summary]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[data-page="previous"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[data-page="next"]')).toBeNull();
    });
  });

  it('keeps Newer and Older when the list is not a search result', () => {
    component.dictations = dictations(6);
    component.ngOnChanges({});
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-result-summary]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-page="next"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Older');
    expect(fixture.nativeElement.textContent).not.toContain('Newer');
  });

  it('view from search opens the dictation by id', () => {
    const dictation = TestData.fillInDictation();
    component.openById = true;
    component.dictations = [dictation];
    component.ngOnChanges({});
    fixture.detectChanges();

    fixture.debugElement.query(By.css('#dictation-list ion-button')).triggerEventHandler('click', null);

    expect(component.navService.openDictationById).toHaveBeenCalledWith(dictation.id, true);
    expect(component.navService.pushOpenDictation).not.toHaveBeenCalled();
  });

  function showDictations(count: number) {
    component.dictations = dictations(count);
    component.ngOnChanges({});
    fixture.detectChanges();
  }

  function dictations(count: number): Dictation[] {
    return Array.from({length: count}, (_, index) => {
      const dictation = TestData.fillInDictation();
      dictation.id = index + 1;
      dictation.title = `Dictation ${index + 1}`;
      return dictation;
    });
  }

  function summaryText(): string {
    return fixture.nativeElement.querySelector('[data-result-summary]')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  }

  function pageButton(which: 'previous' | 'next') {
    return fixture.debugElement.query(By.css(`[data-page="${which}"]`));
  }

  function buttonText(which: 'previous' | 'next'): string {
    return pageButton(which).nativeElement.textContent.replace(/\s+/g, ' ').trim();
  }

  function isDisabled(which: 'previous' | 'next'): boolean {
    const button = pageButton(which);
    return button.componentInstance.disabled === true || button.nativeElement.disabled === true;
  }

  function clickPage(which: 'previous' | 'next') {
    pageButton(which).triggerEventHandler('click', null);
    fixture.detectChanges();
  }

});
