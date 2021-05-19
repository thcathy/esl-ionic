import {Member} from './member';
import {Vocab} from './vocab';

export class Dictation {
  title?: string;
  rating?: number;
  totalRated?: number;
  description?: string;
  tags?: string;
  isPublicAccess?: boolean;
  totalAttempt?: number;
  password?: string;
  notAllowIPA?: boolean;
  notAllowRandomCharacters?: boolean;
  showImage?: boolean;
  lastPracticeDate?: Date;
  lastModifyDate?: Date;
  article?: string;
  creator?: Member;
  vocabs?: Vocab[];
  createdDate?: Date;
  totalRecommended?: number;
  id?: number;
  suitableStudent?: string;
  generated?: boolean;
  sentenceLength?: string;
  wordContainSpace?: boolean;
}

export const SuitableStudentOptions = ['Any', 'Kindergarten', 'JuniorPrimary', 'SeniorPrimary', 'JuniorSecondary', 'SeniorSecondary'];

export const SentenceLengthOptions = ['Short', 'Normal', 'Long', 'VeryLong'];

export class DictationOptions {
  letterPuzzle?: boolean;
  puzzleSize = 10;
}

export class PuzzleControls {
  word: string;
  answers: string[];
  buttons: string[];
  buttonCorrects: boolean[];
  counter = 0;

  constructor(word: string, answers: string[], buttons: string[], buttonCorrects: boolean[]) {
    this.word = word;
    this.answers = answers;
    this.buttons = buttons;
    this.buttonCorrects = buttonCorrects;
  }

  isComplete() { return this.counter >= this.word.length; }
}
