import { Component, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import Auth0Cordova from '@auth0/cordova';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { AppService } from './services/app.service';
import { AuthService } from './services/auth.service';
import { NavigationService } from './services/navigation.service';
import { StorageService } from './services/storage.service';



declare let ga: Function;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  defaultLanguage = 'en';

  constructor(
    public platform: Platform,    
    public statusBar: StatusBar,
    public router: Router,
    public authService: AuthService,
    public translate: TranslateService,
    public navigationService: NavigationService,
    public storage: StorageService,
    public appService: AppService,
    public googleAnalytics: GoogleAnalytics,
    public deeplinks: Deeplinks,
    private log: NGXLogger,
    private zone: NgZone,
  ) {
    this.authService.handleAuthentication();
    this.initializeApp();

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      SplashScreen.hide();
      this.setupGoogleAnalytics();
      this.setupDeepLinks();
      this.initLanguage();
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
    if (!this.appService.isCapacitor()) {
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
    if (!this.appService.isCapacitor()) { return; }

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        if (event.url.includes('com.esl.ionic://thcathy.auth0.com/cordova/com.esl.ionic/callback')) {
          console.log(`auth0 redirect`);
          Auth0Cordova.onRedirectUri(event.url);
        }
                
        // Example url: https://beerswift.app/tabs/tab2
        // slug = /tabs/tab2
        const slug = event.url.split(".com").pop();
        if (slug) {
          this.navigationService.navigate(slug);
        }
        // If no match, do nothing - let regular routing
        // logic take over
      });
    });
  }
}
