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
});
