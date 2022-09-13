import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { environment } from '../environments/environment';
import { AppService } from './services/app.service';
import { FFSAuthService } from './services/auth.service';
import { NavigationService } from './services/navigation.service';
import { StorageService } from './services/storage.service';
import config from '../../capacitor.config';
import { filter } from 'rxjs';
import packageJson from '../../package.json';

declare let gtag: Function;

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
    gtag('config', 'G-T0NL87GWKB', {
      'page_title': packageJson.name,
    });
    
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log(`${JSON.stringify(event)}`);
        gtag('event', 'screen_view', {
          'app_name': packageJson.name,
          'app_version': packageJson.version,
          'screen_name': event.urlAfterRedirects
        });
      });
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
