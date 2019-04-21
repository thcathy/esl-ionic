import {browser, protractor} from 'protractor';
import {AppPageObject} from './page-object/app.po';
import {MenuPageObject} from './page-object/menu.po';

describe('new App', () => {
  const EC = protractor.ExpectedConditions;

  let page: AppPageObject;
  let menu: MenuPageObject;

  beforeEach(() => {
    page = new AppPageObject();
    menu = new MenuPageObject();
  });

  it('should have menu', async () => {
    await page.get();
    expect(menu.menuButton.isPresent()).toBeTruthy();
    expect(menu.menu.isDisplayed()).toBeFalsy();

    menu.get();
    expect(menu.menu.isDisplayed()).toBeTruthy();
  });

  it('click home page button launch instant-dictation page', async () => {
    await page.get();

    page.instantDictationButton.click();
    expect(browser.getCurrentUrl()).toMatch('/instant-dictation$');
  });
});
