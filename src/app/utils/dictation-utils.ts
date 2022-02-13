import {ValidationUtils} from './validation-utils';

export class DictationUtils {
  private static AtoZ = 'abcdefghijklmnopqrstuvwxyz';

  static vocabularyValueToArray(input: string, wordContainSpace: boolean = false): string[] {
    let splitter;
    if (wordContainSpace) {
      splitter = /[^a-zA-Z\- ]+/;
    } else {
      splitter = /[^a-zA-Z\-]+/;
    }
    return input.split(splitter).map(v => v.trim()).filter(v => !ValidationUtils.isBlankString(v));
  }

  static toCharacterSet(word: string, minCharacters = 8): string[] {
    const characters = new Set(this.splitWord(word));
    while (characters.size < minCharacters) {
      const char = DictationUtils.AtoZ.charAt(Math.random() * 26);
      if (!characters.has(char)) {
        characters.add(char);
      }
    }
    return Array.from(characters).sort();
    // return DictationUtils.shuffle(Array.from(characters));
  }

  static splitWord = (word: string): string[] => word.toLowerCase().split('');

  static notValidImages(images: string[]) {
    return images === null || images.length <= 0 || !images.every(s => s.length > 0);
  }
}
