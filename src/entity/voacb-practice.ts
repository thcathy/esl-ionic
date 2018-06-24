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
