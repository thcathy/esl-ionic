import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { SearchDictationPage } from './search-dictation.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {ManageVocabHistoryServiceSpy, StorageSpy} from '../../../testing/mocks-ionic';
import {Storage} from '@ionic/storage';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';

describe('SearchDictationPage', () => {
  let component: SearchDictationPage;
  let fixture: ComponentFixture<SearchDictationPage>;
  let storageSpy;

  beforeEach(async(() => {
    storageSpy = StorageSpy();
    storageSpy.get.and.returnValue(Promise.resolve(['old search history']));

    TestBed.configureTestingModule({
      declarations: [ SearchDictationPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Storage, useValue: storageSpy },
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

  it('date options are pre-set', fakeAsync(() => {
    const thisMonth = new Date().getMonth();
    const options = component.createDateOptions();

    expect(options[0].option).toBe('Any');
    expect(options[0].date).not.toBeDefined();
    expect(options[1].option).toBe('Within 1 Month');
    expect([1, -11]).toContain(thisMonth - options[1].date.getMonth());
    expect(options[2].option).toBe('Within 3 Month');
    expect([3, -9]).toContain(thisMonth - options[2].date.getMonth());
    expect(options[3].option).toBe('Within Half Year');
    expect([6, -6]).toContain(thisMonth - options[3].date.getMonth());
  }));

  it('history is loaded from storage when init, and updated when search', fakeAsync(() => {
    component.ionViewDidLoad();
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
    component.history = ['apple', 'banana', 'await'];
    component.keyword.setValue('a');
    component.filterHistory(null);

    expect(component.filteredHistory.length).toBe(2);
    expect(component.filteredHistory[0]).toBe('apple');
    expect(component.filteredHistory[1]).toBe('await');
  });

  it('do not store duplicate search history', fakeAsync(() => {
    component.keyword.setValue(`new search`);
    component.search();
    tick();
    component.search();
    tick();

    expect(component.history.length).toBe(1);
    expect(component.history[0]).toBe('new search');
  }));
});
