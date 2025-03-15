import {fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {of} from 'rxjs';
import {memberVocabularyMember1Apple, memberVocabularyMember1Banana, memberVocabularyMember1Cat} from '../../../testing/test-data';
import {VocabPracticeService} from '../practice/vocab-practice.service';
import {StorageService} from '../storage.service';
import {ManageVocabHistoryService} from './manage-vocab-history.service';

describe('ManageVocabHistoryService', () => {
  let service: ManageVocabHistoryService;
  let storageSpy: StorageService;
  let vocabPracticeServiceSpy: VocabPracticeService;

  beforeEach(waitForAsync(() => {
    storageSpy = jasmine.createSpyObj('Storage', {
      get: Promise.resolve()
    });

    vocabPracticeServiceSpy = jasmine.createSpyObj('VocabPracticeService', {
      getAllHistory: of([memberVocabularyMember1Apple(), memberVocabularyMember1Banana(), memberVocabularyMember1Cat()])
    });

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ManageVocabHistoryService,
        { provide: StorageService, useValue: storageSpy},
        { provide: VocabPracticeService, useValue: vocabPracticeServiceSpy}
      ]
    });

    service = TestBed.inject(ManageVocabHistoryService);
  }));

  it('test randomWordsFromBefore with different input, output length', () => {
    const result = service.randomWordsFromBefore(1);
    expect(result.length).toBe(0);
  });

  it('load and classified vocabulary from local storage when construction', fakeAsync(() => {
    service.loadFromServer();
    tick();
    expect(service.learntVocabs.size).toBe(1);
    expect(service.learntVocabs.get('apple').id.word).toBe('apple');
    expect(service.answeredBefore.size).toBe(2);
    expect(service.answeredBefore.get('banana').id.word).toBe('banana');
  }));

  it('findMemberVocabulary', fakeAsync(() => {
    service.loadFromServer();
    tick();
    expect(service.isLearnt(memberVocabularyMember1Apple())).toBeTruthy();
    expect(service.isLearnt(memberVocabularyMember1Banana())).toBeFalsy();
  }));

  it('classify vocabulary will update the maps', fakeAsync(() => {
    service.loadFromServer();
    tick();
    const banana = memberVocabularyMember1Banana();
    banana.correct = 1;
    const cat = memberVocabularyMember1Cat();
    cat.correct = 10;
    service.classifyVocabulary([banana, cat]);

    expect(service.learntVocabs.size).toBe(2);
    expect(service.answeredBefore.size).toBe(1);
    expect(service.answeredBefore.get('banana').id.word).toBe('banana');
    expect(service.answeredBefore.get('banana').correct).toBe(1);
  }));
});
