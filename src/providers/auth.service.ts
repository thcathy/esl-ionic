import {Injectable, NgZone} from '@angular/core';
import {App, Events, NavController} from "ionic-angular";
import Auth0Cordova from '@auth0/cordova';
import Auth0 from 'auth0-js';
import {AppService} from "./app.service";
import {HomePage} from "../pages/home/home";
import {Storage} from "@ionic/storage";
import {MemberHomePage} from "../pages/member-home/member-home";
import {TranslateService} from "@ngx-translate/core";

const auth0CordovaConfig = {
  // needed for auth0
  clientID: 'W8nTboR1CzD4nyytnxnnIYn2JhiVU1PL',

  // needed for auth0cordova
  clientId: 'W8nTboR1CzD4nyytnxnnIYn2JhiVU1PL',
  domain: 'thcathy.auth0.com',
  callbackURL: location.href,
  packageIdentifier: 'com.esl.ionic',
  scope: 'openid profile'
};

@Injectable()
export class AuthService {
  userProfile: any;
  idTokenKey = 'id_token';
  expiresAtKey = 'expires_at';
  accessTokenKey = 'access_token';
  accessToken: string;
  idToken: string;

  auth0 = new Auth0.WebAuth({
    clientID: 'W8nTboR1CzD4nyytnxnnIYn2JhiVU1PL',
    domain: 'thcathy.auth0.com',
    responseType: 'token id_token',
    audience: 'https://thcathy.auth0.com/userinfo',
    redirectUri: window.location.origin,
    scope: 'openid profile'
  });

  auth0Cordova = new Auth0.WebAuth(auth0CordovaConfig);


  constructor(protected app: App,
              public zone: NgZone,
              protected appService: AppService,
              public storage: Storage,
              public events: Events,
              public translate: TranslateService) {
    try {
      this.userProfile = JSON.parse(localStorage.getItem('profile'));
      this.idToken = localStorage.getItem(this.idTokenKey);
    } catch (e) {
      localStorage.setItem(this.idTokenKey, null);
    }
  }

  getNavCtrl(): NavController {
    return this.app.getRootNav();
  }

  public login(): void {
    if (this.appService.isApp()) {
      console.log('login by cordova');
      this.loginCordova();
    } else {
      console.log('login by auth0 web page');
      this.auth0.authorize({
        languageBaseUrl: this.getAuth0Language()
      });
    }
  }

  public signUp(): void {
    if (this.appService.isApp()) {
      this.loginCordova(true);
    } else {
      console.log('sign up by auth0 web page');
      this.auth0.authorize({
        initialScreen: 'signUp',
        languageBaseUrl: this.getAuth0Language()
      });
    }
  }


  public handleAuthentication(): void {
    console.log('handleAuthentication');

    this.auth0.parseHash((err, authResult) => {
      console.log(`handleAuthentication: err ${err}, result ${authResult}`);
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.events.publish('user:login');
        window.location.hash = '';
        this.setSession(authResult);
        this.getNavCtrl().setRoot(MemberHomePage);
        this.getProfile((err) => {
          console.warn(`cannot get profile: ${err}`);
        });
      } else if (err) {
        this.getNavCtrl().setRoot(HomePage);
        console.log(err);
      }
    });
  }

  public loginCordova(signUp = false) {
    const client = new Auth0Cordova(auth0CordovaConfig);
    const options = { scope: 'openid profile offline_access' };
    if (signUp) {
      options['initialScreen'] = 'signUp';
      options['languageBaseUrl'] = this.getAuth0Language();
    }

    client.authorize(options, (err, authResult) => {
      if(err) {
        throw err;
      }
      this.setSession(authResult);
      this.auth0Cordova.client.userInfo(this.accessToken, (err, profile) => {
        if(err) {
          this.getNavCtrl().setRoot(HomePage);
          throw err;
        }

        profile.user_metadata = profile.user_metadata || {};
        localStorage.setItem('profile', JSON.stringify(profile));
        this.zone.run(() => {
          this.userProfile = profile;
        });
        this.getNavCtrl().setRoot(MemberHomePage);
      });
    });
  }

  private setSession(authResult): void {
    console.log('login session: update session');
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    console.info(`expiresAt: ${expiresAt}`);

    localStorage.setItem(this.accessTokenKey, authResult.accessToken);
    localStorage.setItem(this.idTokenKey, authResult.idToken);
    localStorage.setItem(this.expiresAtKey, expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // Go back to the home route
    this.getNavCtrl().setRoot(HomePage);
    this.userProfile = null;
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
  }

  public getProfile(cb): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access token must exist to fetch profile');
    }

    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        console.log(`user profile: ${JSON.stringify(profile)}`);
        localStorage.setItem('profile', JSON.stringify(profile));
        self.userProfile = profile;
      }
      cb(err, profile);
    });
  }

  public requireAuthenticated(): boolean {
    if (!this.isAuthenticated()) {
      console.log(`require login, redirect to login page`);
      alert(`Please login!`);
      this.login();
      return false;
    }
    return true;
  }

  private getAuth0Language() {
    const locale = this.translate.currentLang;
    if (locale != null) {
      if (locale.indexOf("zh") > -1)
        return "zh-tw";
    }
    return "en";
  }
}
