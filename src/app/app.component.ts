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
import {NGXLogger} from 'ngx-logger';
import {Deeplinks} from '@ionic-native/deeplinks/ngx';
import {DictationViewPage} from './pages/dictation-view/dictation-view.page';

declare let ga: Function;
declare let gtag: Function;
declare const window: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  defaultLanguage = 'en';

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
    public deeplinks: Deeplinks,
    private log: NGXLogger,
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
      this.setupDeepLinks();

      // (window as any).handleOpenURL = (url) => {
      //  this.log.info(`url: ${url}`);
      //  Auth0Cordova.onRedirectUri(url);
      // };
    });
  }

  private initLanguage() {
    this.translate.addLangs(['en', 'zh-Hans', 'zh-Hant']);
    this.translate.setDefaultLang(this.defaultLanguage);
    this.storage.get(NavigationService.storageKeys.language).then(locale => {
      if (locale != null) { this.translate.use(locale); }
    });
  }

  private setupGoogleAnalytics() {
    if (!this.appService.isCordova()) {
      const script = document.createElement('script');
      script.onload = function () {
        window.dataLayer = window.dataLayer || [];
        function gtag(x, y) {window.dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'UA-114755687-2');
      };
      script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-114755687-2';
      document.head.appendChild(script);

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          ga('set', 'page', event.urlAfterRedirects);
          ga('send', 'pageview');
        }
      });
    } else {
      this.googleAnalytics.startTrackerWithId('UA-114755687-1')
        .then(() => {
          this.log.info('Google analytics is ready now');
          this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
              this.log.info(`google analytics track view ${event.urlAfterRedirects}`);
              this.googleAnalytics.trackView(event.urlAfterRedirects);
            }
          });
        })
        .catch(e => this.log.error('Error starting GoogleAnalytics', e));
    }
  }

  private setupDeepLinks() {
    if (!this.appService.isCordova()) { return; }

    this.deeplinks.route({
      '/link/dictation-view': DictationViewPage,
      '/link/dictation-view/:dictationId': DictationViewPage
    })
      .subscribe((match) => {
        // match.$route - the route we matched, which is the matched entry from the arguments to route()
        // match.$args - the args passed in the link
        // match.$link - the full link data
        // alert(`Successfully matched route ${JSON.stringify(match.$args)}, ${JSON.stringify(match.$link)}`);
        this.navigationService.navigate(match.$link.path, match.$args);
      },
      (nomatch) => {
        if (nomatch.$link.url.includes('com.esl.ionic://thcathy.auth0.com/cordova/com.esl.ionic/callback')) {
          console.log(`auth0 redirect`);
          Auth0Cordova.onRedirectUri(nomatch.$link.url);
        } else {
          console.error(`Got a deeplink that did not match ${JSON.stringify(nomatch.$link)}`);
        }
      });
  }
}
