import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { environment } from '../environments/environment';
import { AppService } from './services/app.service';
import { FFSAuthService } from './services/auth.service';
import { NavigationService } from './services/navigation.service';
import { StorageService } from './services/storage.service';
import config from '../../capacitor.config';

declare let ga: Function;

const auth0CallbackUri = `${config.appId}://${environment.auth0Host}/capacitor/${config.appId}/callback`;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  defaultLanguage = 'en';

  constructor(
    public platform: Platform,    
    public router: Router,
    public authService: FFSAuthService,
    public translate: TranslateService,
    public navigationService: NavigationService,
    public storage: StorageService,
    public appService: AppService,
    public googleAnalytics: GoogleAnalytics,
    private log: NGXLogger,
    private zone: NgZone,
  ) {
    this.authService.handleAuthCallbackWeb();
    this.initializeApp();
  }

  ngOnInit(): void {
    this.setupAppUrlOpenListener();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
      this.setupGoogleAnalytics();
      this.initLanguage();
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

  private setupAppUrlOpenListener() {
    if (!this.appService.isCapacitor()) { return; }

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        console.log(`url=${event.url}`)
        if (event.url.includes(auth0CallbackUri)) {
          this.authService.handleAuthCallbackCapacitor(event.url);
          return;
        }
                
        // Example url: https://beerswift.app/tabs/tab2
        // slug = /tabs/tab2
        const slug = event.url.split(".com").pop();
        if (slug) {
          this.navigationService.navigate(slug);
        }
      });
    });
  }
}
