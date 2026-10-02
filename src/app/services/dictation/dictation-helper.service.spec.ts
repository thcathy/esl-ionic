import {Dictation, Dictations} from '../../entity/dictation';
import {Vocab} from '../../entity/vocab';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {TestData} from '../../../testing/test-data';
import {DictationHelper} from './dictation-helper.service';

describe('DictationHelper', () => {
  let service: DictationHelper = new DictationHelper();

  beforeEach(() => {
  });

  describe('isSentenceDictation', () => {
    it('treats a non-blank article as a sentence dictation when type is absent', () => {
      expect(service.isSentenceDictation(<Dictation>{ article: 'It is a sentence dictation.' })).toBeTrue();
    });

    it('treats a blank article as vocabulary when type is absent', () => {
      expect(service.isSentenceDictation(<Dictation>{ article: '' })).toBeFalse();
      expect(service.isSentenceDictation(<Dictation>{ article: ' ' })).toBeFalse();
    });

    it('uses type when article is absent', () => {
      expect(service.isSentenceDictation(<Dictation>{ type: 'Article' })).toBeTrue();
      expect(service.isSentenceDictation(<Dictation>{ type: 'Vocab' })).toBeFalse();
      expect(service.isSentenceDictation(<Dictation>{ article: null, type: 'Article' })).toBeTrue();
      expect(service.isSentenceDictation(<Dictation>{})).toBeFalse();
    });

    it('uses server type when it disagrees with article text', () => {
      expect(service.isSentenceDictation(<Dictation>{ article: 'Hello.', type: 'Vocab' })).toBeFalse();
      expect(service.isSentenceDictation(<Dictation>{ article: '', type: 'Article' })).toBeTrue();
    });
  });

  describe('test wordsToPractice', () => {
    it('retry wrong word practice will return wrong words only', () => {
      let dictation = TestData.fillInDictation();
      dictation = dictation.withRetryWrongWordOptions();
      const words = service.wordsToPractice(dictation);
      expect(words.length).toEqual(1);  // setup in TestData.vocabPracticeHistories
    });

    it('normal dictation will return all words in vocab[]', () => {
      const dictation = TestData.fillInDictation();
      const words = service.wordsToPractice(dictation);
      expect(words.length).toEqual(dictation.vocabs.length);
    });
  });

  describe('previewLine', () => {
    it('uses a trimmed description even when vocabs and article are present', () => {
      expect(service.previewLine(<Dictation>{
        description: '  Hi  ',
        type: 'Vocab',
        vocabs: [<Vocab>{word: 'apple'}, <Vocab>{word: 'banana'}],
        article: 'This article must not win.',
      })).toBe('Hi');
    });

    it('falls through a whitespace-only description to the vocab words', () => {
      const line = service.previewLine(<Dictation>{
        description: '  \n  ',
        type: 'Vocab',
        article: 'Article must not win for a vocab row.',
        vocabs: [
          <Vocab>{word: 'ice cream'},
          <Vocab>{word: ' '},
          <Vocab>{word: ''},
          <Vocab>{word: 'apple'},
        ],
      });

      expect(line).toBe('ice cream, apple');
    });

    it('falls through a whitespace-only description to article text', () => {
      const line = service.previewLine(<Dictation>{
        description: '   ',
        type: 'Article',
        vocabs: [<Vocab>{word: 'apple'}],
        article: '  Cats\nsit.  ',
      });

      expect(line).toBe('Cats sit.');
    });

    it('joins every non-blank vocab in order and does not cap the count', () => {
      const words = ['one', 'two', 'three', 'four', 'five', 'six'];
      expect(service.previewLine(<Dictation>{
        type: 'Vocab',
        article: 'Must not use the article.',
        vocabs: words.map((word) => <Vocab>{word}),
      })).toBe(words.join(', '));
    });

    it('keeps a long article with whitespace collapsed and does not cap the word count', () => {
      expect(service.previewLine(<Dictation>{
        type: 'Article',
        vocabs: [<Vocab>{word: 'apple'}, <Vocab>{word: 'banana'}],
        article: '  One two\tthree\nfour   five six seven eight  ',
      })).toBe('One two three four five six seven eight');
    });

    it('uses article text when type is absent and the article is non-blank', () => {
      expect(service.previewLine(<Dictation>{
        article: 'No type on this row.',
        vocabs: [<Vocab>{word: 'apple'}],
      })).toBe('No type on this row.');
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
