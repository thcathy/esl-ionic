import { browser, by, element } from 'protractor';

export class InstantDictationPageObject {
  vocabInput0 = element(by.deepCss('ion-input[id=vocab0] input'));
  startByWordButton = element(by.id('start-by-word-button'));

  get() {
    return browser.get('/instant-dictation');
  }

  setVocabInput0(input: string) {
    this.vocabInput0.sendKeys(input);
  }
}
