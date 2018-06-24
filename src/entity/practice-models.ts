import {Member} from "./member";

export interface PracticeHistory {
  id: string;
  createdDate: Date;
  member: Member;
  wrong: number;
  correct: number;
  historyJSON: string;
  eslPracticeType: string;
  dictationId: number;
}

export const ESLPracticeType = ['PhoneticPractice', 'PhoneticSymbolPractice', 'VocabPractice', 'IrregularVerbPractice', 'VocabDictation', 'SentenceDictation'];

