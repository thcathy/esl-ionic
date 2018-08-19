import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {NavigationEnd, Router} from "@angular/router";
import {AuthService} from "./services/auth.service";
import {TranslateService} from "@ngx-translate/core";

import Auth0Cordova from '@auth0/cordova';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  defaultLanguage = 'en';
  languageKey = 'language';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService,
    private storage: Storage,
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
