import { browser, by, element } from 'protractor';

export class MenuPageObject {
  menuButton = element(by.tagName('ion-menu-button'));
  menu = element(by.tagName('ion-menu'));

  get() {
    this.menuButton.click();
  }
}
