import {browser} from 'protractor';
import {AppPageObject} from './page-object/app.po';
import {MenuPageObject} from './page-object/menu.po';

describe('new App', () => {
  let page: AppPageObject;
  let menu: MenuPageObject;

  beforeEach(() => {
    page = new AppPageObject();
    menu = new MenuPageObject();
  });

  it('should have menu', () => {
    page.get();
    expect(menu.menuButton.isPresent()).toBeTruthy();
    expect(menu.menu.isDisplayed()).toBeFalsy();

    menu.get();
    expect(menu.menu.isDisplayed()).toBeTruthy();
  });

  it('click home page button launch instant-dictation page', () => {
    page.get();
    page.instantDictationButton.click();
    expect(browser.getCurrentUrl()).toMatch('/instant-dictation$');
  });
});
