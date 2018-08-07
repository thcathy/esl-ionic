import {Dictation} from "./dictation";

export class DictationStatistics {
  constructor(
    public type: string,
    public dictations: Dictation[]
  ) { }

  public toString() {
    return JSON.stringify(this);
  }
}
