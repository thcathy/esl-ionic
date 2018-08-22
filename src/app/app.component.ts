import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {NavigationEnd, Router} from "@angular/router";
import {AuthService} from "./services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import { Storage } from '@ionic/storage';

import Auth0Cordova from '@auth0/cordova';
import {NavigationService} from "./services/navigation.service";
import {AppService} from "./services/app.service";

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
  ) {
    this.authService.handleAuthentication();
    this.initializeApp();
    this.initLanguage();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          ga('set', 'page', event.urlAfterRedirects);
          ga('send', 'pageview');
        }
      });

      (<any>window).handleOpenURL = (url) => {
        console.log(`url: ${url}`);
        debugger;
        Auth0Cordova.onRedirectUri(url);
      };
    });
  }

  private initLanguage() {
    this.translate.addLangs(["en", "zh-Hans", "zh-Hant"]);
    this.translate.setDefaultLang(this.defaultLanguage);
    this.storage.get(this.languageKey).then(locale => {
      if (locale != null) this.translate.use(locale);
    });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.storage.set(this.languageKey, lang);
  }

  openContactUs() {
    window.open(this.translate.instant('ContactUsUrl'), '_system');
  }
}
