import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import {NavigationEnd, Router} from '@angular/router';
import {AuthService} from './services/auth.service';
import {TranslateService} from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

import Auth0Cordova from '@auth0/cordova';
import {NavigationService} from './services/navigation.service';
import {AppService} from './services/app.service';

declare let ga: Function;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  defaultLanguage = 'en';
  languageKey = 'language';

  constructor(
    public platform: Platform,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,
    public router: Router,
    public authService: AuthService,
    public translate: TranslateService,
    public navigationService: NavigationService,
    public storage: Storage,
    public appService: AppService,
    public googleAnalytics: GoogleAnalytics,
  ) {
    this.authService.handleAuthentication();
    this.initializeApp();
    this.initLanguage();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.setupGoogleAnalytics();

      (<any>window).handleOpenURL = (url) => {
        console.log(`url: ${url}`);
        Auth0Cordova.onRedirectUri(url);
      };
    });
  }

  private initLanguage() {
    this.translate.addLangs(['en', 'zh-Hans', 'zh-Hant']);
    this.translate.setDefaultLang(this.defaultLanguage);
    this.storage.get(this.languageKey).then(locale => {
      if (locale != null) { this.translate.use(locale); }
    });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.storage.set(this.languageKey, lang);
  }

  openContactUs() {
    window.open(this.translate.instant('ContactUsUrl'), '_system');
  }

  private setupGoogleAnalytics() {
    if (!this.appService.isCordova()) {
      (function(i, s, o, g, r, a, m) {i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments); }, i[r].l = 1 * new Date().getMilliseconds(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
      })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

      ga('create', 'UA-114755687-2', 'auto');

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          ga('set', 'page', event.urlAfterRedirects);
          ga('send', 'pageview');
        }
      });
    } else {
      this.googleAnalytics.startTrackerWithId('UA-114755687-1')
        .then(() => {
          console.log('Google analytics is ready now');
          this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
              console.log(`google analytics track view ${event.urlAfterRedirects}`);
              this.googleAnalytics.trackView(event.urlAfterRedirects);
            }
          });
        })
        .catch(e => console.log('Error starting GoogleAnalytics', e));
    }
  }
}
