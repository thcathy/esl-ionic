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

  it('load and classified vocabulary from local storage when construction', fakeAsync(() => {
    service.loadFromServer();
    tick();
    expect(service.learntVocabularies.size).toBe(1);
    expect(service.learntVocabularies.get('apple').id.word).toBe('apple');
    expect(service.alwaysWrongVocabularies.size).toBe(1);
    expect(service.alwaysWrongVocabularies.get('banana').id.word).toBe('banana');
  }));

});
