import {Member} from "./member";

export interface MemberVocabulary {
  id: MemberVocabularyId;
  correct: number;
  wrong: number;
  createdDate?: Date;
  lastUpdatedDate?: Date;

}

export interface MemberVocabularyId {
  member: Member;
  word: string;
}
