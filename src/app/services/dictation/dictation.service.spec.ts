import {CreateDictationHistoryRequest, DictationService, SearchDictationRequest} from './dictation.service';
import {dictation1, vocab_apple, vocab_banana} from '../../../testing/test-data';
import {Dictation} from '../../entity/dictation';
import {SentenceHistory} from '../../entity/sentence-history';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {VocabPracticeService} from '../practice/vocab-practice.service';
import {DictationHelper} from './dictation-helper.service';

describe('DictationService', () => {
  let service: DictationService;
  let httpClientSpy;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    service = new DictationService(httpClientSpy, new VocabPracticeService(httpClientSpy), new DictationHelper());
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

  it('search posts the request body', () => {
    const request: SearchDictationRequest = { keyword: 'school', suitableStudent: 'Any', type: 'Article' };

    service.search(request);

    const [url, body] = httpClientSpy.post.calls.mostRecent().args;
    expect(url).toContain('/dictation/search');
    expect(body).toBe(request);
  });

  it('isSentenceDictation uses type when article is missing', () => {
    expect(service.isSentenceDictation(<Dictation>{ type: 'Article' })).toBeTrue();
    expect(service.isSentenceDictation(<Dictation>{ type: 'Vocab' })).toBeFalse();
    expect(service.isSentenceDictation(<Dictation>{ article: 'It is a sentence dictation.' })).toBeTrue();
  });

});
