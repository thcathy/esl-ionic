import {fakeAsync, TestBed, tick} from "@angular/core/testing";
import {ManageVocabHistoryService} from "./manage-vocab-history.service";
import {Storage} from "@ionic/storage";
import {VocabPracticeService} from "../practice/vocab-practice.service";
import {memberVocabularyMember1Apple, memberVocabularyMember1Banana} from "../../../test-config/test-data";
import {Observable} from "rxjs";

describe('ManageVocabHistoryService', () => {
  let service: ManageVocabHistoryService;
  let storageSpy: Storage;
  let vocabPracticeServiceSpy: VocabPracticeService;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('Storage', {
      get: Promise.resolve()
    });

    vocabPracticeServiceSpy = jasmine.createSpyObj('VocabPracticeService', {
      getAllHistory: Observable.of([memberVocabularyMember1Apple, memberVocabularyMember1Banana])
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
  });

  it('test randomFrequentlyWrongVocabs with different input, output length', () => {
    let result = service.randomFrequentlyWrongVocabs(1);
    expect(result.length).toBe(0);
  });

  it('load and classified vocabulary from local storage when construction', fakeAsync(() => {
    service.loadFromServer();
    tick();
    expect(service.learntVocabs.size).toBe(1);
    expect(service.learntVocabs.get('apple').id.word).toBe('apple');
    expect(service.frequentlyWrongVocabs.size).toBe(1);
    expect(service.frequentlyWrongVocabs.get('banana').id.word).toBe('banana');
  }));
});
