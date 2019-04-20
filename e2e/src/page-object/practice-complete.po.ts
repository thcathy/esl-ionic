import { browser, by, element } from 'protractor';

export class PracticeCompletePageObject {
  header = element(by.deepCss('app-practice-complete ion-card-header'));
  practiceHistoryList = element(by.deepCss('practice-history-list'));
}
