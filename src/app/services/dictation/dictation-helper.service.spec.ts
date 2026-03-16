import {toArray} from 'rxjs';
import {Dictations} from '../../entity/dictation';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {TestData} from '../../../testing/test-data';
import {DictationHelper} from './dictation-helper.service';

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

  describe('toCopyDraft', () => {
    it('force id to -1 and preserve editable fields', () => {
      const source = TestData.fillInDictation();
      source.id = 123;
      source.title = 'Original Title';
      source.description = 'Original Description';
      source.suitableStudent = 'JuniorPrimary';
      source.wordContainSpace = true;
      source.includeAIImage = true;

      const copied = service.toCopyDraft(source);

      expect(copied.id).toEqual(-1);
      expect(copied.title).toEqual(source.title);
      expect(copied.description).toEqual(source.description);
      expect(copied.suitableStudent).toEqual(source.suitableStudent);
      expect(copied.source).toEqual(source.source);
      expect(copied.wordContainSpace).toBeTrue();
      expect(copied.includeAIImage).toBeTrue();
    });

    it('deep copy vocabs and avoid shared references', () => {
      const source = TestData.fillInDictation();
      const copied = service.toCopyDraft(source);

      expect(copied.vocabs).toBeDefined();
      expect(copied.vocabs).not.toBe(source.vocabs);
      expect(copied.vocabs.length).toEqual(source.vocabs.length);

      source.vocabs[0].word = 'mutated-source-word';
      expect(copied.vocabs[0].word).not.toEqual('mutated-source-word');
    });

    it('copy options keys used by edit/start flows', () => {
      const source = TestData.fillInDictation();
      source.options.practiceType = VocabPracticeType.Puzzle;
      source.options.voiceMode = 'local';
      source.options.caseSensitiveSentence = true;
      source.options.checkPunctuation = true;
      source.options.speakPunctuation = true;
      source.options.retryWrongWord = true;
      source.options.vocabPracticeHistories = TestData.vocabPracticeHistories;

      const copied = service.toCopyDraft(source);

      expect(copied.options.practiceType).toEqual(VocabPracticeType.Puzzle);
      expect(copied.options.voiceMode).toEqual('local');
      expect(copied.options.caseSensitiveSentence).toBeTrue();
      expect(copied.options.checkPunctuation).toBeTrue();
      expect(copied.options.speakPunctuation).toBeTrue();
      expect(copied.options.retryWrongWord).toBeTrue();
      expect(copied.options.vocabPracticeHistories).toBeUndefined();
    });

    it('copy sentence dictation content', () => {
      const source = new TestData.DefaultSentenceDictation();
      source.source = Dictations.Source.FillIn;
      source.sentenceLength = 'Long';
      source.description = 'Sentence description';
      source.suitableStudent = 'SeniorPrimary';

      const copied = service.toCopyDraft(source);

      expect(copied.id).toEqual(-1);
      expect(copied.article).toEqual(source.article);
      expect(copied.sentenceLength).toEqual('Long');
      expect(copied.description).toEqual('Sentence description');
      expect(copied.suitableStudent).toEqual('SeniorPrimary');
    });
  });

});
