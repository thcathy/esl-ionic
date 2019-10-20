import {CreateDictationHistoryRequest, DictationService} from "./dictation.service";
import {dictation1, vocab_apple, vocab_banana} from "../../../testing/test-data";
import {Dictation} from "../../entity/dictation";
import {SentenceHistory} from "../../entity/sentence-history";
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";
import {VocabPracticeService} from "../practice/vocab-practice.service";

describe('DictationService', () => {
  let service: DictationService;
  let httpClientSpy;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    service = new DictationService(httpClientSpy, new VocabPracticeService(httpClientSpy));
  });

  it('createVocabDictationHistory will call http post with expected parameters', () => {
    const dictation1 = <Dictation>{ id: 1 };
    const vocabHistories1 = [
      <VocabPracticeHistory>{ question: vocab_apple },
      <VocabPracticeHistory>{ question: vocab_banana }
    ];

    service.createVocabDictationHistory(dictation1, 1, vocabHistories1);
    const callArg: CreateDictationHistoryRequest = httpClientSpy.post.calls.mostRecent().args[1];
    expect(callArg.dictationId).toEqual(1);
    expect(callArg.mark).toEqual(1);
    expect(callArg.correct).toEqual(1);
    expect(callArg.wrong).toEqual(1);
    expect(callArg.histories.length).toEqual(2);
    expect(callArg.historyJSON.length).toBeGreaterThan(20);
    expect(callArg.histories[0].question.picsFullPaths.length).toBeLessThan(1);
    expect(callArg.histories[0].question.picsFullPathsInString.length).toBeLessThan(1);
    expect(callArg.histories[0].question.grades.length).toBeLessThan(1);
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
