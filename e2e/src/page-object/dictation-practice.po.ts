import { browser, by, element } from 'protractor';

export class DictationPracticePageObject {
  vocabImageImg = element(by.deepCss('vocab-image img'));
  answerInput = element(by.deepCss('.answerInput input'));
  submitButton = element(by.deepCss('.submitBtn'));

  setAnswer(input: string) {
    this.answerInput.sendKeys(input);
  }

}
