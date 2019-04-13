import { AppPage } from './app.po';
import {by, element} from 'protractor';

describe('new App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should have menu', () => {
    page.navigateTo();
    expect(element(by.tagName('ion-menu-button')).isPresent()).toBeTruthy();
    expect(element(by.tagName('ion-menu')).isDisplayed()).toBeFalsy();

    element(by.tagName('ion-menu-button')).click();
    expect(element(by.tagName('ion-menu')).isDisplayed()).toBeTruthy();
  });
});
