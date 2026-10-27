import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {AnalyticsService} from '../../services/analytics.service';
import {AppService} from '../../services/app.service';
import {
  APP_STORE_BADGE_URL,
  APP_STORE_URL,
  PLAY_STORE_BADGE_URL,
  PLAY_STORE_URL,
} from '../../utils/store-links';
import {ShareInstallBannerComponent} from './share-install-banner.component';

describe('ShareInstallBannerComponent', () => {
  let fixture: ComponentFixture<ShareInstallBannerComponent>;
  let appService: jasmine.SpyObj<AppService>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let router: {url: string};

  beforeEach(waitForAsync(() => {
    appService = jasmine.createSpyObj('AppService', ['isApp']);
    appService.isApp.and.returnValue(false);
    analytics = jasmine.createSpyObj('AnalyticsService', ['shareBannerImpress', 'shareBannerClick']);
    router = {url: '/link/dictation-view/42'};

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
    });
    translate.use('en');
  });

  afterEach(() => {
    fixture?.destroy();
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
  });

  it('ignores the query and hash when deciding to show', () => {
    router.url = '/link/dictation-view/42?ref=share#top';
    expect(render().visible).toBeTrue();

    router.url = '/dictation-view/42?from=/link/dictation-view';
    fixture.detectChanges();
    expect(fixture.componentInstance.visible).toBeFalse();
    expect(banner()).toBeNull();
  });

  it('hides the banner on a normal dictation view and still records the impress', () => {
    router.url = '/dictation-view/42';
    const component = render();
    expect(component.visible).toBeFalse();
    expect(banner()).toBeNull();
    expect(analytics.shareBannerImpress).toHaveBeenCalledTimes(1);
  });

  it('hides the banner in the native app and still records the impress', () => {
    appService.isApp.and.returnValue(true);
    const component = render();
    expect(component.visible).toBeFalse();
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
