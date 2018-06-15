import {Member} from "../src/entity/member";
import {Name} from "../src/entity/name";
import {Dictation} from "../src/entity/dictation";

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
  title: 'test dictation 1',
  article: 'sentence to learn'
};

