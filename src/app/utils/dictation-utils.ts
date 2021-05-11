import {ValidationUtils} from './validation-utils';

export class DictationUtils {

  static vocabularyValueToArray(input: string, wordContainSpace: boolean = false): string[] {
    let splitter;
    if (wordContainSpace) {
      splitter = /[\n,]+/;
    } else {
      splitter = /[\s,]+/;
    }
    return input.split(splitter).map(v => v.trim()).filter(v => !ValidationUtils.isBlankString(v));
  }

}
