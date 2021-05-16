import {ValidationUtils} from './validation-utils';

export class DictationUtils {
  private static AtoZ = 'abcdefghijklmnopqrstuvwxyz';

  static vocabularyValueToArray(input: string, wordContainSpace: boolean = false): string[] {
    let splitter;
    if (wordContainSpace) {
      splitter = /[\n,]+/;
    } else {
      splitter = /[\s,]+/;
    }
    return input.split(splitter).map(v => v.trim()).filter(v => !ValidationUtils.isBlankString(v));
  }

  static toCharacters(word: string, minCharacters = 10): string[] {
    const characters = new Set(this.splitWord(word));
    while (characters.size < minCharacters) {
      const char = DictationUtils.AtoZ.charAt(Math.random() * 26);
      if (!characters.has(char)) {
        characters.add(char);
      }
    }
    return DictationUtils.shuffle(Array.from(characters));
  }

  static splitWord = (word: string): string[] => word.toLowerCase().split('');

  private static shuffle(array: string[]): string[] {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

}
