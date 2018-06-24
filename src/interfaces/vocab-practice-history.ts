import {VocabPractice} from "../entity/voacb-practice";

export interface VocabPracticeHistory {
  answer?: string,
  correct?: boolean,
  question?: VocabPractice,
  state?: string
}
