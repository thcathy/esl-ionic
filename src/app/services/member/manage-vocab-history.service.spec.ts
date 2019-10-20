import {async, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ManageVocabHistoryService} from './manage-vocab-history.service';
import {Storage} from '@ionic/storage';
import {VocabPracticeService} from '../practice/vocab-practice.service';
import {
  memberVocabularyMember1Apple,
  memberVocabularyMember1Banana,
  memberVocabularyMember1Cat
} from '../../../testing/test-data';
import {Observable} from 'rxjs';
import 'rxjs-compat/add/observable/of';

describe('ManageVocabHistoryService', () => {
  let service: ManageVocabHistoryService;
  let storageSpy: Storage;
  let vocabPracticeServiceSpy: VocabPracticeService;

  beforeEach(async(() => {
    storageSpy = jasmine.createSpyObj('Storage', {
      get: Promise.resolve()
    });

    vocabPracticeServiceSpy = jasmine.createSpyObj('VocabPracticeService', {
      getAllHistory: Observable.of([memberVocabularyMember1Apple(), memberVocabularyMember1Banana(), memberVocabularyMember1Cat()])
    });

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ManageVocabHistoryService,
        { provide: Storage, useValue: storageSpy},
        { provide: VocabPracticeService, useValue: vocabPracticeServiceSpy}
      ]
    });

    service = TestBed.get(ManageVocabHistoryService);
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
