import {Member} from './member';
import {Vocab} from './vocab';
import {VocabPracticeType} from '../enum/vocab-practice-type.enum';

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
  sentenceLength?: string;
  wordContainSpace?: boolean;
  options?: Dictation.Options;
  source?: string;
}

export namespace Dictation {
  export enum Source {
    FillIn = 'FillIn',
    Generate = 'Generate',
    Select = 'Select',
  }

  export class Options {
    practiceType?: VocabPracticeType;
  }
}

export const SuitableStudentOptions = ['Any', 'Kindergarten', 'JuniorPrimary', 'SeniorPrimary', 'JuniorSecondary', 'SeniorSecondary'];

export const SentenceLengthOptions = ['Short', 'Normal', 'Long', 'VeryLong'];

export class  PuzzleControls {
  word: string;
  answers: string[];
  buttons: string[];
  buttonCorrects: boolean[];
  counter = 0;
  answerState = '';

  constructor(word: string, answers: string[], buttons: string[], buttonCorrects: boolean[]) {
    this.word = word;
    this.answers = answers;
    this.buttons = buttons;
    this.buttonCorrects = buttonCorrects;
  }

  isComplete() { return this.counter >= this.word.length; }
}
