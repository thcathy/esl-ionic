import {DictationUtils} from './dictation-utils';

describe('DictationUtils', () => {
  describe('vocabularyValueToArray', () => {
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

    it('can split input by numbers', () => {
      const vocabs1 = DictationUtils.vocabularyValueToArray(`
    1. apple
    2. banana
    3. dog
    `, true);
      expect(vocabs1.length).toEqual(3);
      expect(vocabs1[0]).toEqual('apple');
      expect(vocabs1[1]).toEqual('banana');
      expect(vocabs1[2]).toEqual('dog');

      const vocabs2 = DictationUtils.vocabularyValueToArray(`1. apple 2) banana 3 . dog`, true);
      expect(vocabs2.length).toEqual(3);
      expect(vocabs2[0]).toEqual('apple');
      expect(vocabs2[1]).toEqual('banana');
      expect(vocabs2[2]).toEqual('dog');
    });

    it('do not create vocabulary without a-z', () => {
      const vocab = DictationUtils.vocabularyValueToArray(`-- -- -'- --- - ' ''`, false);
      expect(vocab.length).toEqual(0);
      const vocab2 = DictationUtils.vocabularyValueToArray(`-- -- -- --''- - ' ''`, true);
      expect(vocab2.length).toEqual(0);
    });

    it('vocabulary can contain single quote', () => {
      const vocab = DictationUtils.vocabularyValueToArray(`charles's bus-stop`, false);
      expect(vocab.length).toEqual(2);

      const vocab2 = DictationUtils.vocabularyValueToArray(`
      charles's
      bus-stop
      `, true);
      expect(vocab2.length).toEqual(2);
    });
  });


  describe('test toCharacters', () => {
    it('toCharacters can provide character array in different size', () => {
      expect(DictationUtils.toCharacterSet('apple', 10).length).toEqual(10);
      expect(DictationUtils.toCharacterSet('apple', 3).length).toEqual(4);
      expect(DictationUtils.toCharacterSet('apple', 4).length).toEqual(4);
      expect(DictationUtils.toCharacterSet('ice-cream', 10).length).toEqual(10);
      expect(DictationUtils.toCharacterSet('bus stop', 10).length).toEqual(10);
    });

    it('toCharacters result are sorted', () => {
      const chars1 = DictationUtils.toCharacterSet('apple', 10);
      for (let i = 0; i < chars1.length - 1; i++) {
        expect(chars1[i] < chars1[i + 1]).toBeTrue();
      }
    });

    it('toCharacters result are lowercase', () => {
      const chars1 = DictationUtils.toCharacterSet('apple', 10);
      expect(chars1.join().toLowerCase()).toEqual(chars1.join());
    });

  });

});
