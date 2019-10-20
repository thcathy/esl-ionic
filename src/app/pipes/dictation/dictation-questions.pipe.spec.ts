import { DictationQuestionsPipe } from './dictation-questions.pipe';
import {TranslateService} from '@ngx-translate/core';
import {ArticleDictationService} from '../../services/dictation/article-dictation.service';
import {NGXLoggerSpy} from '../../../testing/mocks-ionic';
import {dictation1} from '../../../testing/test-data';
import {Dictation} from '../../entity/dictation';

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
      vocabs: ['a', 'b', 'c']
    };

    expect(pipe.transform(dictation)).toBe('3 Vocab(s)');
  });
});
