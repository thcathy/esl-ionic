import { NGXLoggerSpy } from '../../../testing/mocks-ionic';
import { dictation1 } from '../../../testing/test-data';
import { Dictation } from '../../entity/dictation';
import { Vocab } from '../../entity/vocab';
import { ArticleDictationService } from '../../services/dictation/article-dictation.service';
import { DictationHelper } from '../../services/dictation/dictation-helper.service';
import { DictationQuestionsPipe } from './dictation-questions.pipe';

describe('DictationQuestionsPipe', () => {
  let translateServiceSpy;

  beforeEach(() => {
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateServiceSpy.instant.and.callFake((value) => value);
  });

  function createPipe(
    dictationHelper: Pick<DictationHelper, 'isSentenceDictation'> = new DictationHelper(),
    articleDictationService = new ArticleDictationService(NGXLoggerSpy()),
  ): DictationQuestionsPipe {
    return new DictationQuestionsPipe(
      dictationHelper as DictationHelper,
      articleDictationService,
      translateServiceSpy,
    );
  }

  function helperReturning(sentence: boolean) {
    const helper = jasmine.createSpyObj('DictationHelper', ['isSentenceDictation']);
    helper.isSentenceDictation.and.returnValue(sentence);
    return helper;
  }

  it('sentence dictation show number of sentences', () => {
    const pipe = createPipe(helperReturning(true));

    expect(pipe.transform(dictation1)).toBe('1 Sentence');
  });

  it('vocabulary dictation show number of vocabularies', () => {
    const pipe = createPipe(helperReturning(false));
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
    const articleService = new ArticleDictationService(NGXLoggerSpy());
    spyOn(articleService, 'divideToSentences');
    const pipe = createPipe(helperReturning(false), articleService);
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
    const pipe = createPipe(helperReturning(true));
    const dictation = <Dictation>{...dictation1, questionCount: 4};

    expect(pipe.transform(dictation)).toBe('4 Sentence');
  });

  it('labels a short sentence hit Sentence when article is omitted', () => {
    const pipe = createPipe();
    const dictation = <Dictation>{
      id: 3,
      title: 'A sentence',
      questionCount: 1,
      type: 'Article',
    };

    expect(pipe.transform(dictation)).toBe('1 Sentence');
  });

  it('labels a short vocab hit Vocab(s) when article and vocabs are omitted', () => {
    const pipe = createPipe();
    const dictation = <Dictation>{
      id: 1,
      title: 'Testing 1',
      questionCount: 2,
      type: 'Vocab',
    };

    expect(pipe.transform(dictation)).toBe('2 Vocab(s)');
  });

  it('labels a short vocab hit with no question count as zero vocabs', () => {
    expect(createPipe().transform(<Dictation>{ type: 'Vocab' })).toBe('0 Vocab(s)');
  });
});
