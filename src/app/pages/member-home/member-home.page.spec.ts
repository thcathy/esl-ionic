import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {MemberHomePage} from './member-home.page';
import {SharedTestModule} from "../../../testing/shared-test.module";
import {StorageService} from '../../services/storage.service';
import {UIOptionsService} from '../../services/ui-options.service';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {Dictation} from '../../entity/dictation';

describe('MemberHomePage', () => {
  let component: MemberHomePage;
  let fixture: ComponentFixture<MemberHomePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberHomePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Start Review uses the remembered practice type', fakeAsync(() => {
    const storage = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    storage.get.and.callFake((key: string) => {
      if (key === UIOptionsService.keys.vocabPracticeType) {
        return Promise.resolve(VocabPracticeType.Paper);
      }
      return Promise.resolve(null);
    });
    const dictation = { id: -1, vocabs: [{ word: 'apple' }] } as Dictation;
    spyOn(component.manageVocabHistoryService, 'generatePracticeFromAnsweredBefore').and.returnValue(dictation);

    component.onVocabHistoryList('reviewAll');
    tick();

    expect(component.navigationService.startDictation).toHaveBeenCalledWith(dictation);
    expect(dictation.options.practiceType).toBe(VocabPracticeType.Paper);
  }));

  it('Start Review stays Spelling when nothing is remembered', fakeAsync(() => {
    const storage = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    storage.get.and.returnValue(Promise.resolve(null));
    const dictation = { id: -1, vocabs: [{ word: 'apple' }] } as Dictation;
    spyOn(component.manageVocabHistoryService, 'generatePracticeFromAnsweredBefore').and.returnValue(dictation);

    component.onVocabHistoryList('reviewAll');
    tick();

    expect(dictation.options.practiceType).toBe(VocabPracticeType.Spell);
  }));
});
