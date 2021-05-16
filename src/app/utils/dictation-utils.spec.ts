import {DictationUtils} from './dictation-utils';

describe('DictationUtils', () => {
  it('vocabularyValueToArray can split input to string arrays', () => {
    let count;
    count = DictationUtils.vocabularyValueToArray(`apple banana`).length;
    expect(count).toEqual(2);

    count = DictationUtils.vocabularyValueToArray(`apple,banana`).length;
    expect(count).toEqual(2);

    count = DictationUtils.vocabularyValueToArray(`apple
    banana`).length;
    expect(count).toEqual(2);

    count = DictationUtils.vocabularyValueToArray(`apple banana`, true).length;
    expect(count).toEqual(1);

    count = DictationUtils.vocabularyValueToArray(`apple,banana`, true).length;
    expect(count).toEqual(2);

    const vocabs = DictationUtils.vocabularyValueToArray(`
    apple
    banana cake
    dog egg
    `, true);
    expect(vocabs.length).toEqual(3);
    expect(vocabs[0]).toEqual('apple');
    expect(vocabs[1]).toEqual('banana cake');
    expect(vocabs[2]).toEqual('dog egg');
  });

  describe('test toCharacters', () => {
    it('toCharacters can provide character array in different size', () => {
      expect(DictationUtils.toCharacters('apple', 10).length).toEqual(10);
      expect(DictationUtils.toCharacters('apple', 3).length).toEqual(4);
      expect(DictationUtils.toCharacters('apple', 4).length).toEqual(4);
      expect(DictationUtils.toCharacters('ice-cream', 10).length).toEqual(10);
      expect(DictationUtils.toCharacters('bus stop', 10).length).toEqual(10);
    });

    it('toCharacters result are random', () => {
      const chars1 = DictationUtils.toCharacters('apple', 10);
      const chars2 = DictationUtils.toCharacters('apple', 10);
      expect(chars1.join().localeCompare(chars2.join()) !== 0).toBeTrue();
    });

    it('toCharacters result are lowercase', () => {
      const chars1 = DictationUtils.toCharacters('apple', 10);
      expect(chars1.join().toLowerCase()).toEqual(chars1.join());
    });
  });

});
