import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Router} from '@angular/router';
import {Platform} from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';

import packageJson from '../../../../package.json';
import {FFSAuthService} from '../../services/auth.service';
import {AppService} from '../../services/app.service';
import {NavigationService} from '../../services/navigation.service';
import {FooterComponent} from './footer';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;
  let appService: jasmine.SpyObj<AppService>;
  let platform: jasmine.SpyObj<Platform>;
  let router: {url: string};

  beforeEach(waitForAsync(() => {
    appService = jasmine.createSpyObj('AppService', ['isApp']);
    platform = jasmine.createSpyObj('Platform', ['width']);
    router = {url: '/home'};

    TestBed.configureTestingModule({
      declarations: [FooterComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        {provide: AppService, useValue: appService},
        {provide: Platform, useValue: platform},
        {provide: Router, useValue: router},
        {provide: NavigationService, useValue: {}},
        {provide: FFSAuthService, useValue: {isAuthenticated$: of(false)}},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  function render(app: boolean, width: number, url: string): void {
    fixture?.destroy();
    appService.isApp.and.returnValue(app);
    platform.width.and.returnValue(width);
    router.url = url;
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function dom() {
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
    return {
      columns: text.includes('About Us'),
      banner: !!el.querySelector('ion-img[src="assets/img/footer_hd.png"]'),
      badges: !!el.querySelector('img.appImage'),
      credit: text.includes('Developing by Timmy Wong'),
      version: text.includes(packageJson.version),
    };
  }

  it('wide web home shows columns, banner, store badges, and credit', () => {
    render(false, 768, '/home');
    expect(component.isWide).toBeTrue();
    expect(component.isHome).toBeTrue();
    expect(component.showFullFooter).toBeTrue();
    expect(component.showBanner).toBeTrue();
    expect(component.showSlimFooter).toBeFalse();
    expect(dom()).toEqual({columns: true, banner: true, badges: true, credit: true, version: true});
  });

  it('wide web non-home stays full', () => {
    render(false, 1024, '/search-dictation');
    expect(component.showFullFooter).toBeTrue();
    expect(component.showSlimFooter).toBeFalse();
    expect(dom()).toEqual({columns: true, banner: true, badges: true, credit: true, version: true});
  });

  it('narrow web home shows the full footer', () => {
    render(false, 767, '/home');
    expect(component.isWide).toBeFalse();
    expect(component.showFullFooter).toBeTrue();
    expect(dom()).toEqual({columns: true, banner: true, badges: true, credit: true, version: true});
  });

  it('narrow web non-home is credit and version only', () => {
    render(false, 767, '/search-dictation?q=cat');
    expect(component.isHome).toBeFalse();
    expect(component.showFullFooter).toBeFalse();
    expect(component.showBanner).toBeFalse();
    expect(component.showSlimFooter).toBeTrue();
    expect(dom()).toEqual({columns: false, banner: false, badges: false, credit: true, version: true});
  });

  it('native app home is full without store badges', () => {
    render(true, 1024, '/home');
    expect(component.showFullFooter).toBeTrue();
    expect(component.showBanner).toBeTrue();
    expect(dom()).toEqual({columns: true, banner: true, badges: false, credit: true, version: true});
  });

  it('native app non-home is credit and version only', () => {
    render(true, 400, '/dictation-practice');
    expect(component.showFullFooter).toBeFalse();
    expect(component.showBanner).toBeFalse();
    expect(component.showSlimFooter).toBeTrue();
    expect(dom()).toEqual({columns: false, banner: false, badges: false, credit: true, version: true});
  });

  it('treats /home with a query or hash as home', () => {
    render(false, 400, '/home#top');
    expect(component.isHome).toBeTrue();
    expect(component.showFullFooter).toBeTrue();

    render(true, 400, '/home?ref=1');
    expect(component.isHome).toBeTrue();
    expect(component.showFullFooter).toBeTrue();
    expect(dom().badges).toBeFalse();
  });
});
