import { toArray } from 'rxjs';
import { TestData } from '../../../testing/test-data';
import { DictationHelper } from './dictation-helper.service';

describe('DictationHelper', () => {
  let service: DictationHelper = new DictationHelper();

  beforeEach(() => {
  });

  describe('test wordsToPractice', () => {
    it('retry wrong word practice will return wrong words only', done => {
      let dictation = TestData.fillInDictation();
      dictation = dictation.withRetryWrongWordOptions();
      const words$ = service.wordsToPractice(dictation);
      
      words$.pipe(toArray()).subscribe((words: string[]) => {
        expect(words.length).toEqual(1);  // setup in TestData.vocabPracticeHistories
        done();
      });
    });

    it('normal dictation will return all words in vocab[]', done => {
      let dictation = TestData.fillInDictation();
      const words$ = service.wordsToPractice(dictation);

      words$.pipe(toArray()).subscribe((words: string[]) => {
        console.log(`${words}`);
        expect(words.length).toEqual(dictation.vocabs.length);
        done();
      });
    });
  });

});