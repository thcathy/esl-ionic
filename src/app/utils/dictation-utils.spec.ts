import {DictationUtils} from './dictation-utils';

fdescribe('DictationUtils', () => {
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

    count = DictationUtils.vocabularyValueToArray(`apple
    banana cake
    dog egg`, true).length;
    expect(count).toEqual(3);
  });
});
