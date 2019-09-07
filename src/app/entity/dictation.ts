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
}

export const SuitableStudentOptions = ['Any', 'Kindergarten', 'JuniorPrimary', 'SeniorPrimary', 'JuniorSecondary', 'SeniorSecondary'];

export const SentenceLengthOptions = ['Short', 'Normal', 'Long', 'VeryLong'];

