import {browser, protractor} from 'protractor';
import {InstantDictationPageObject} from '../page-object/instant-dictation.po';
import {DictationPracticePageObject} from '../page-object/dictation-practice.po';
import {PracticeCompletePageObject} from '../page-object/practice-complete.po';

describe('new App', () => {
  let page: InstantDictationPageObject;
  let dictationPractice: DictationPracticePageObject;
  let practiceComplete: PracticeCompletePageObject;
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    page = new InstantDictationPageObject();
    dictationPractice = new DictationPracticePageObject();
    practiceComplete = new PracticeCompletePageObject();
  });

  it('start a vocabulary dictation, then submit correct answer', async () => {
    page.get();
    page.setVocabInput0('apple');
    expect(page.vocabInput0.getAttribute('value')).toBe('apple');

    page.startByWordButton.click();
    browser.wait(EC.urlContains('/dictation-practice'));
    browser.wait(EC.presenceOf(dictationPractice.vocabImageImg));
    expect(browser.getCurrentUrl()).toMatch('/dictation-practice$');

    dictationPractice.setAnswer('apple');
    dictationPractice.submitButton.click();
    browser.wait(EC.urlContains('/practice-complete'));

    browser.wait(EC.presenceOf(practiceComplete.practiceHistoryList));
    browser.wait(EC.textToBePresentInElement(practiceComplete.header, 'You got 1 marks in 1 questions'));
    expect(practiceComplete.header.getText()).toBe('You got 1 marks in 1 questions');
  });
});
