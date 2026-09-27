import { NGXLoggerSpy } from '../../../testing/mocks-ionic';
import { dictation1 } from '../../../testing/test-data';
import { Dictation } from '../../entity/dictation';
import { Vocab } from '../../entity/vocab';
import { ArticleDictationService } from '../../services/dictation/article-dictation.service';
import { DictationQuestionsPipe } from './dictation-questions.pipe';

describe('DictationQuestionsPipe', () => {
  let translateServiceSpy;

  beforeEach(() => {
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateServiceSpy.instant.and.callFake((value) => value);
  });

  it('sentence dictation show number of sentences', () => {
    const dictationServiceSpy = jasmine.createSpyObj('DictationService', ['isSentenceDictation']);
    dictationServiceSpy.isSentenceDictation.and.returnValue(true);

    const pipe = new DictationQuestionsPipe(dictationServiceSpy, new ArticleDictationService(NGXLoggerSpy()), translateServiceSpy);

    expect(pipe.transform(dictation1)).toBe('1 Sentence');
  });

  it('vocabulary dictation show number of vocabularies', () => {
    const dictationServiceSpy = jasmine.createSpyObj('DictationService', ['isSentenceDictation']);
    dictationServiceSpy.isSentenceDictation.and.returnValue(false);

    const pipe = new DictationQuestionsPipe(dictationServiceSpy, new ArticleDictationService(NGXLoggerSpy()), translateServiceSpy);
    const dictation = <Dictation>{
      vocabs: [
        <Vocab>{word: 'apple'},
        <Vocab>{word: 'banana'},
        <Vocab>{word: 'cat'},
      ]
    };

    expect(pipe.transform(dictation)).toBe('3 Vocab(s)');
  });

  it('uses questionCount when that field is present', () => {
    const dictationServiceSpy = jasmine.createSpyObj('DictationService', ['isSentenceDictation']);
    dictationServiceSpy.isSentenceDictation.and.returnValue(false);
    const articleService = new ArticleDictationService(NGXLoggerSpy());
    spyOn(articleService, 'divideToSentences');

    const pipe = new DictationQuestionsPipe(dictationServiceSpy, articleService, translateServiceSpy);
    const dictation = <Dictation>{
      questionCount: 0,
      vocabs: [
        <Vocab>{word: 'apple'},
        <Vocab>{word: 'banana'},
        <Vocab>{word: 'cat'},
      ]
    };

    expect(pipe.transform(dictation)).toBe('0 Vocab(s)');
    expect(articleService.divideToSentences).not.toHaveBeenCalled();
  });

  it('uses questionCount for a sentence dictation', () => {
    const dictationServiceSpy = jasmine.createSpyObj('DictationService', ['isSentenceDictation']);
    dictationServiceSpy.isSentenceDictation.and.returnValue(true);

    const pipe = new DictationQuestionsPipe(dictationServiceSpy, new ArticleDictationService(NGXLoggerSpy()), translateServiceSpy);
    const dictation = <Dictation>{...dictation1, questionCount: 4};

    expect(pipe.transform(dictation)).toBe('4 Sentence');
  });
});
