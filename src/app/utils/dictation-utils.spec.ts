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
});
