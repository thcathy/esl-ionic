import {Component, NgZone, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {App, URLOpenListenerEvent} from '@capacitor/app';
import {SplashScreen} from '@capacitor/splash-screen';
import {Platform} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {NGXLogger} from 'ngx-logger';
import {environment} from '../environments/environment';
import {AppService} from './services/app.service';
import {FFSAuthService} from './services/auth.service';
import {NavigationService} from './services/navigation.service';
import {StorageService} from './services/storage.service';
import config from '../../capacitor.config';
import packageJson from '../../package.json';
import {ServerService} from "./services/server.service";

declare let gtag: Function;

const auth0CallbackUri = `${config.appId}://${environment.auth0Host}/capacitor/${config.appId}/callback`;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  defaultLanguage = 'en';
  networkAlertConfig = {
    showAlert: false,
    buttons: ['OK']
  }

  constructor(
    public platform: Platform,
    public router: Router,
    public authService: FFSAuthService,
    public translate: TranslateService,
    public navigationService: NavigationService,
    public storage: StorageService,
    public appService: AppService,
    public serverService: ServerService,
    private log: NGXLogger,
    private zone: NgZone,
  ) {
    this.authService.handleAuthCallbackWeb();
    this.initializeApp();
  }

  ngOnInit(): void {
    this.setupAppUrlOpenListener(); // would it be put in initializeApp or platform ready?
    this.healthCheck(); // execute when first started
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
      this.setupGoogleAnalytics();
      this.initLanguage();

      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
        if (isActive) {
          this.healthCheck();
        }
      });
    });
  }

  healthCheck() {
    if (this.networkAlertConfig.showAlert) return;

    this.serverService.healthCheck()
      .subscribe({
        next: () =>  this.networkAlertConfig.showAlert = false,
        error: (err) => {
          console.error(`health failed: ${JSON.stringify(err)}`);
          this.networkAlertConfig.showAlert = true;
        }
    });
  }

  private initLanguage() {
    this.translate.addLangs(['en', 'zh-Hans', 'zh-Hant']);
    this.translate.setDefaultLang(this.defaultLanguage);
    this.storage.get(NavigationService.storageKeys.language).then(locale => {
      if (locale != null) { 
        this.translate.use(locale); 
      } else {
        this.translate.use(this.translate.getBrowserLang() || this.defaultLanguage);
      }
    });
  }

  private setupGoogleAnalytics() {
    if (!environment.production) return;

    gtag('config', 'G-T0NL87GWKB', {
      page_title: packageJson.name,
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

  closeNetworkAlert() {
    this.networkAlertConfig.showAlert = false;
    this.navigationService.openHomePage();
    setTimeout(() => this.healthCheck(), 5000); // 5 seconds
  }
}
