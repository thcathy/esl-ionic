import {Grade} from "./grade";

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
  ipaunavailable?: boolean;
  ipa?: string;
  activePronounceLink?: string;
  picsFullPathsInString?: string;
  suffledWord?: string;
}

export enum VocabDifficulty {
  Beginner = "Beginner",
  Easy = "Easy",
  Normal = "Normal",
  Hard = "Hard",
  VeryHard = "VeryHard",
}

export let vocabDifficulties = [VocabDifficulty.Beginner, VocabDifficulty.Easy, VocabDifficulty.Normal, VocabDifficulty.Hard, VocabDifficulty.VeryHard];
