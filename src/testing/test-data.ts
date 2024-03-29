import {Member} from '../app/entity/member';
import {Dictation, Dictations} from '../app/entity/dictation';
import {Name} from '../app/entity/name';
import {SentenceHistory} from '../app/entity/sentence-history';
import {VocabPractice} from '../app/entity/voacb-practice';
import {MemberVocabulary} from '../app/entity/member-vocabulary';
import {Vocab} from '../app/entity/vocab';
import { VocabPracticeHistory } from '../app/entity/vocab-practice-history';
import { VocabPracticeType } from '../app/enum/vocab-practice-type.enum';

export const vocabs1 = [
  <Vocab>{word: 'apple'},
  <Vocab>{word: 'banana'},
  <Vocab>{word: 'cat'},
];

export const vocab_apple = <VocabPractice>{
  id: 1,
  pronouncedLink: 'http://dictionary.cambridge.org/media/english/uk_pron/u/uka/ukapp/ukappen014.mp3',
  pronouncedLinkBackup: 'https://s.yimg.com/tn/dict/dreye/live/f/apple.mp3',
  word: 'apple',
  picFileName: 'FRUT_032.jpg',
  frequency: 18.9,
  rank: 3193,
  grades: [],
  picsFullPaths: [
    'data:image/png;base64,*************************************************************',
    'data:image/png;base64,*************************************************************',
    'data:image/png;base64,*************************************************************',
  ],
  picsFullPathsInString: 'data:image/png;base64,*************************************************************',
  ipa: 'ˋæpl',
  activePronounceLink: 'http://dictionary.cambridge.org/media/english/uk_pron/u/uka/ukapp/ukappen014.mp3',
  ipaunavailable: false,
  suffledWord: 'lapep'
};

export const vocab_banana = <VocabPractice>{
  id: 104,
  pronouncedLink: 'http://dictionary.cambridge.org/media/english/uk_pron/u/ukb/ukbal/ukballs018.mp3',
  pronouncedLinkBackup: 'https://s.yimg.com/tn/dict/dreye/live/f/banana.mp3',
  word: 'banana',
  picFileName: 'FRUT_113.jpg',
  frequency: 9.49,
  rank: 4828,
  grades: [],
  picsFullPaths: [
    'data:image/png;base64,*************************************************************',
    'data:image/png;base64,*************************************************************',
    'data:image/png;base64,*************************************************************',
  ],
  picsFullPathsInString: 'data:image/png;base64,*************************************************************',
  ipa: 'bəˋnɑ:nə',
  activePronounceLink: 'http://dictionary.cambridge.org/media/english/uk_pron/u/ukb/ukbal/ukballs018.mp3',
  ipaunavailable: false,
  suffledWord: 'aaanbn'
};

export namespace TestData {
  export class DefaultSentenceDictation extends Dictation {
    id = 1;
    title = 'test sentence dictation 1';
    article = 'testing';
    options = new Dictations.Options();
  }

  class DefaultVocabDictation extends Dictation {
    id = 1;
    title = 'test dictation 1';
    vocabs = vocabs1;
    showImage = true;
    options = new Dictations.Options();

    withRetryWrongWordOptions() {
      this.options.retryWrongWord = true;
      this.options.vocabPracticeHistories = vocabPracticeHistories;
      return this;
    }
  }

  export function instantDictation() {
    const d = new DefaultVocabDictation();
    d.source = Dictations.Source.FillIn;
    d.id = null;
    return d;
  }

  export function fillInDictation() {
    const d = new DefaultVocabDictation();
    d.source = Dictations.Source.FillIn;
    return d;
  }

  export function selectDictation() {
    const d = new DefaultVocabDictation();
    d.source = Dictations.Source.Select;
    return d;
  }

  export function generateDictation() {
    const d = new DefaultVocabDictation();
    d.source = Dictations.Source.Generate;
    return d;
  }

  export const vocabPracticeHistories: VocabPracticeHistory[] = [
    <VocabPracticeHistory>{question: vocab_apple, correct: true},
    <VocabPracticeHistory>{question: vocab_banana, correct: false}
  ] as VocabPracticeHistory[];
}

export const member1 = new Member(
  1,
  'tester1',
  new Name('Tester', 'A'),
  new Date('1980-03-02'),
  'address',
  '43420024',
  'A school name',
  20,
  'tester@gmail.com',
  null,
  new Date('2008-01-01'));

export const dictation1 = <Dictation>{
  id: 1,
  title: 'test dictation 1',
  article: 'sentence to learn',
  source: Dictations.Source.FillIn
};

export const dictation1Histories = [
  <SentenceHistory>{question: 'sentence to learn', answer: 'sentence to learn', questionSegments: [''], isCorrect: [true]}
];

export const dictation2_vocabDictation = <Dictation>{
  id: 2,
  title: 'test dictation 2',
  vocabs: [
    <Vocab>{word: 'apple'},
    <Vocab>{word: 'banana'},
    <Vocab>{word: 'cat'},
  ],
  showImage: true
};

export const memberVocabularyMember1Apple = () => <MemberVocabulary>{
  id: {
    word: 'apple',
    member: member1,
  },
  correct: 10,
  wrong: 0
};

export const memberVocabularyMember1Banana = () => <MemberVocabulary>{
  id: {
    word: 'banana',
    member: member1,
  },
  correct: 3,
  wrong: 2,
};

export const memberVocabularyMember1Cat = () => <MemberVocabulary>{
  id: {
    word: 'cat',
    member: member1,
  },
  correct: 0,
  wrong: 1,
};





