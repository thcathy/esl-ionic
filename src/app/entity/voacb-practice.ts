import {Grade} from './grade';

export interface VocabPractice {
  id?: number;
  pronouncedLink?: string;
  pronouncedLinkBackup?: string;
  word?: string;
  picFileName?: string;
  frequency?: number;
  rank?: number;
  grades?: Grade[];
  createdDate?: Date;
  picsFullPaths?: string[];
  /** True when CDN images are AI-generated and not human-verified. */
  imageUnverified?: boolean;
  /**
   * Result of CDN image fetch for preload accounting.
   * - ok: images accepted for display
   * - filtered: CDN had images but they were hidden (e.g. unverified + includeAIImage off)
   * - missing: no usable CDN image (404 / empty / error)
   */
  imageLoadStatus?: 'ok' | 'filtered' | 'missing';
  ipaunavailable?: boolean;
  ipa?: string;
  activePronounceLink?: string;
  picsFullPathsInString?: string;
  suffledWord?: string;
}

export enum VocabDifficulty {
  Beginner = 'Beginner',
  Easy = 'Easy',
  Normal = 'Normal',
  Hard = 'Hard',
  VeryHard = 'VeryHard',
}

export let vocabDifficulties = [VocabDifficulty.Beginner, VocabDifficulty.Easy, VocabDifficulty.Normal, VocabDifficulty.Hard, VocabDifficulty.VeryHard];
