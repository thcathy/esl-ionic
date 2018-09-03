import {Member} from "../app/entity/member";
import {Dictation} from "../app/entity/dictation";
import {Name} from "../app/entity/name";
import {SentenceHistory} from "../app/entity/sentence-history";


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
  article: 'sentence to learn'
};

export const dictation1Histories = [
  <SentenceHistory>{question: 'sentence to learn', answer: 'sentence to learn', questionSegments: [''], isCorrect: [true]}
]

