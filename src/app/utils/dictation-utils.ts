import {ValidationUtils} from './validation-utils';

export class DictationUtils {

  static vocabularyValueToArray(input: string, ignoreSpace: boolean = false): string[] {
    let splitter;
    if (ignoreSpace) {
      splitter = /[\n,]+/;
    } else {
      splitter = /[\s,]+/;
    }
    return input.split(splitter).filter(v => !ValidationUtils.isBlankString(v));
  }

}
