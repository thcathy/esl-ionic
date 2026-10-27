import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';

import {AnalyticsService} from '../../services/analytics.service';
import {AppService} from '../../services/app.service';
import {
  APP_STORE_BADGE_URL,
  APP_STORE_URL,
  PLAY_STORE_BADGE_URL,
  PLAY_STORE_URL,
} from '../../utils/store-links';
import {ShareInstallBannerComponent} from './share-install-banner.component';
import {SHARE_INSTALL_BANNER_DISMISS_KEY} from './share-install-banner.logic';

describe('ShareInstallBannerComponent', () => {
  let fixture: ComponentFixture<ShareInstallBannerComponent>;
  let appService: jasmine.SpyObj<AppService>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let events: Subject<unknown>;
  let router: {
    url: string;
    events: Subject<unknown>;
    getCurrentNavigation: () => null;
    lastSuccessfulNavigation: () => {id: number} | null;
  };
  let lastNavId: number | null;

  beforeEach(waitForAsync(() => {
    sessionStorage.removeItem(SHARE_INSTALL_BANNER_DISMISS_KEY);
    appService = jasmine.createSpyObj('AppService', ['isApp']);
    appService.isApp.and.returnValue(false);
    analytics = jasmine.createSpyObj('AnalyticsService', ['shareBannerImpress', 'shareBannerClick']);
    events = new Subject<unknown>();
    lastNavId = 1;
    router = {
      url: '/link/dictation-view/42',
      events,
      getCurrentNavigation: () => null,
      lastSuccessfulNavigation: () => lastNavId == null ? null : {id: lastNavId},
    };

    TestBed.configureTestingModule({
      declarations: [ShareInstallBannerComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        {provide: AppService, useValue: appService},
        {provide: AnalyticsService, useValue: analytics},
        {provide: Router, useValue: router},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'ShareInstallBanner.Title': 'Same account on the website and in the app. Practise anytime, anywhere.',
      'ShareInstallBanner.Region': 'Website and app',
      'Close': 'Close',
    });
    translate.use('en');
  });

  afterEach(() => {
    fixture?.destroy();
    sessionStorage.removeItem(SHARE_INSTALL_BANNER_DISMISS_KEY);
  });

  function render(): ShareInstallBannerComponent {
    fixture?.destroy();
    fixture = TestBed.createComponent(ShareInstallBannerComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function banner(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.share-install-banner');
  }

  it('shows footer store badges on a web share link and impresses once', () => {
    const component = render();
    const el = banner();
    expect(component.visible).toBeTrue();
    expect(el?.textContent).toContain('Same account on the website and in the app. Practise anytime, anywhere.');
    expect(el?.getAttribute('aria-label')).toBe('Website and app');
    expect(el?.textContent).not.toContain('Start');
    expect(el?.textContent).not.toContain('Save');
    expect(el?.textContent).not.toContain('Recommend');

    const badges = el!.querySelector('.share-install-banner__badges');
    const copy = el!.querySelector('.share-install-banner__copy');
    expect(badges).not.toBeNull();
    expect(copy).not.toBeNull();
    expect(badges!.compareDocumentPosition(copy!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const links = el!.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe(APP_STORE_URL);
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].getAttribute('rel')).toBe('noopener');
    expect(links[0].querySelector('img')?.getAttribute('src')).toBe(APP_STORE_BADGE_URL);
    expect(links[1].getAttribute('href')).toBe(PLAY_STORE_URL);
    expect(links[1].querySelector('img')?.getAttribute('src')).toBe(PLAY_STORE_BADGE_URL);

    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(1);
    events.next(new NavigationEnd(1, router.url, router.url));
    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(1);
  });

  it('impresses again on the next navigation that still shows the banner', () => {
    render();
    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(1);
    router.url = '/link/dictation-view/43?ref=1';
    events.next(new NavigationEnd(2, router.url, router.url));
    fixture.detectChanges();
    expect(banner()).not.toBeNull();
    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(2);
  });

  it('hides the banner and skips impress on a normal dictation view', () => {
    router.url = '/dictation-view/42';
    const component = render();
    expect(component.visible).toBeFalse();
    expect(banner()).toBeNull();
    expect(analytics.shareBannerImpress).not.toHaveBeenCalled();
  });

  it('hides the banner in the native app', () => {
    appService.isApp.and.returnValue(true);
    const component = render();
    expect(component.visible).toBeFalse();
    expect(banner()).toBeNull();
    expect(analytics.shareBannerImpress).not.toHaveBeenCalled();
  });

  it('hides for the rest of the tab session after dismiss', () => {
    render();
    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(1);
    const close = fixture.nativeElement.querySelector('.share-install-banner__dismiss') as HTMLButtonElement;
    close.click();
    fixture.detectChanges();
    expect(banner()).toBeNull();
    expect(sessionStorage.getItem(SHARE_INSTALL_BANNER_DISMISS_KEY)).toBe('1');
    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(1);

    router.url = '/link/dictation-view/99';
    events.next(new NavigationEnd(3, router.url, router.url));
    fixture.detectChanges();
    expect(banner()).toBeNull();
    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(1);

    render();
    expect(banner()).toBeNull();
    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(1);
  });

  it('sends the store on badge tap', () => {
    render();
    const links = fixture.debugElement.queryAll(By.css('a'));
    links[0].triggerEventHandler('click', new MouseEvent('click'));
    links[1].triggerEventHandler('click', new MouseEvent('click'));
    expect(analytics.shareBannerClick).toHaveBeenCalledWith('ios');
    expect(analytics.shareBannerClick).toHaveBeenCalledWith('android');
  });
});
