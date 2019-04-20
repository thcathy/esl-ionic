import { browser, by, element } from 'protractor';

export class AppPageObject {
  instantDictationButton = element(by.id('instant-dictation-button'));

  get() {
    return browser.get('/');
  }
}
