import {CreateDictationHistoryRequest, DictationService} from "./dictation.service";
import {dictation1} from "../../../test-config/test-data";
import {Dictation} from "../../entity/dictation";
import {SentenceHistory} from "../../entity/sentence-history";
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";

describe('DictationService', () => {
  let service: DictationService;
  let httpClientSpy;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    service = new DictationService(httpClientSpy);
  });

  it('createVocabDictationHistory will call http post with expected parameters', () => {
    const dictation1 = <Dictation>{ id: 1 };
    const vocabHistories1 = [
      <VocabPracticeHistory>{ question: {picsFullPaths: ['https://abc1.com'], picsFullPathsInString: 'https://abc1.com'} },
      <VocabPracticeHistory>{ question: {picsFullPaths: ['https://abc2.com'], picsFullPathsInString: 'https://abc2.com'} }
    ];

    service.createVocabDictationHistory(dictation1, 1, vocabHistories1);
    const callArg: CreateDictationHistoryRequest = httpClientSpy.post.calls.mostRecent().args[1];
    expect(callArg.dictationId).toEqual(1);
    expect(callArg.mark).toEqual(1);
    expect(callArg.correct).toEqual(1);
    expect(callArg.wrong).toEqual(1);
    expect(callArg.histories.length).toEqual(2);
    expect(callArg.historyJSON.length).toBeGreaterThan(20);
  });

  it('createSentenceDictationHistory will call http post with expected parameters', () => {
    const sentenceHistory = [
      <SentenceHistory>{ question: 'sentence 1' },
      <SentenceHistory>{ question: 'sentence 2' }
    ];

    service.createSentenceDictationHistory(dictation1, 3, 1, sentenceHistory);
    const callArg: CreateDictationHistoryRequest = httpClientSpy.post.calls.mostRecent().args[1];
    expect(callArg.dictationId).toEqual(1);
    expect(callArg.mark).toEqual(0.3);
    expect(callArg.correct).toEqual(3);
    expect(callArg.wrong).toEqual(1);
    expect(callArg.histories).toBeUndefined();
    expect(callArg.historyJSON.length).toBeGreaterThan(20);
  });

});
