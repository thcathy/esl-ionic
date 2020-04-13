import {Injectable, NgZone} from '@angular/core';
import Auth0Cordova from '@auth0/cordova';
import Auth0 from 'auth0-js';
import {AppService} from './app.service';
import {Storage} from '@ionic/storage';
import {TranslateService} from '@ngx-translate/core';
import * as auth0 from 'auth0-js';
import {MemberService} from './member/member.service';
import {NavigationRequest, NavigationService} from './navigation.service';
import {Router} from '@angular/router';
import {ManageVocabHistoryService} from './member/manage-vocab-history.service';
import {LoadingController} from '@ionic/angular';
import {NGXLogger} from 'ngx-logger';

export const tokenTimeoutSecond = 35000;
export const auth0CordovaConfig = {
  // needed for auth0
  clientID: 'Q2x3VfMKsuKtmXuBbuwuTw3ARDZ1xpBS',

  // needed for auth0cordova
  clientId: 'Q2x3VfMKsuKtmXuBbuwuTw3ARDZ1xpBS',
  domain: 'thcathy.auth0.com',
  packageIdentifier: 'com.esl.ionic',
  audience: 'https://thcathy.auth0.com/userinfo'
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  userProfile: any;
  idTokenKey = 'id_token';
  expiresAtKey = 'expires_at';
  accessTokenKey = 'access_token';
  navigationRequestKey = 'navigation_request';
  accessToken: string;
  idToken: string;

  auth0 = new Auth0.WebAuth({
    clientID: 'Q2x3VfMKsuKtmXuBbuwuTw3ARDZ1xpBS',
    domain: 'thcathy.auth0.com',
    responseType: 'token id_token',
    audience: 'https://thcathy.auth0.com/userinfo',
    redirectUri: window.location.origin,
    scope: 'openid profile email'
  });

  auth0Cordova = new auth0.WebAuth(auth0CordovaConfig);

  constructor(public zone: NgZone,
              protected appService: AppService,
              public storage: Storage,
              public translate: TranslateService,
              public memberService: MemberService,
              public navigationService: NavigationService,
              public manageVocabHistoryService: ManageVocabHistoryService,
              public loadingController: LoadingController,
              private router: Router,
              private log: NGXLogger,
  ) {
    try {
      this.userProfile = JSON.parse(localStorage.getItem('profile'));
      this.idToken = localStorage.getItem(this.idTokenKey);
      this.accessToken = localStorage.getItem(this.accessTokenKey);
    } catch (e) {
      localStorage.setItem(this.idTokenKey, null);
    }
  }

  public login(redirectRequest?: NavigationRequest): void {
    this.storage.set(this.navigationRequestKey, redirectRequest);
    this.clearCache();
    if (this.appService.isApp()) {
      this.log.info('login by cordova');
      this.loginCordova();
    } else {
      this.log.info('login by auth0 web page');
      this.auth0.authorize({
        languageBaseUrl: this.getAuth0Language()
      });
    }
  }

  public signUp(): void {
    if (this.appService.isApp()) {
      this.loginCordova(true);
    } else {
      this.log.info('sign up by auth0 web page');
      this.auth0.authorize({
        initialScreen: 'signUp',
        languageBaseUrl: this.getAuth0Language()
      });
    }
  }

  public handleAuthentication(): void {
    this.log.info('handleAuthentication');
    this.auth0.parseHash((err, authResult) => this.handleAuthResult(this.auth0Cordova, authResult, err));
  }

  public loginCordova(signUp = false) {
    const client = new Auth0Cordova(auth0CordovaConfig);
    const options = { scope: 'openid profile offline_access email' };
    options['languageBaseUrl'] = this.getAuth0Language();
    if (signUp) {
      options['initialScreen'] = 'signUp';
    }

    client.authorize(options, (err, authResult) => this.handleAuthResult(this.auth0Cordova, authResult, err));
  }

  private setSession(authResult): void {
    this.log.info('login session: update session');
    const expiresAt = JSON.stringify(tokenTimeoutSecond * 1000 + new Date().getTime());
    this.log.info(`token expiresAt: ${expiresAt}`);

    this.accessToken = authResult.accessToken;
    localStorage.setItem(this.accessTokenKey, authResult.accessToken);
    localStorage.setItem(this.idTokenKey, authResult.idToken);
    localStorage.setItem(this.expiresAtKey, expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');


    this.accessToken = null;
    this.userProfile = null;

    // Go back to the home route
    this.router.navigate(['/home']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
  }

  public requireAuthenticated(): boolean {
    if (!this.isAuthenticated()) {
      this.log.info(`require login, redirect to login page`);
      alert(`Please login!`);
      this.login();
      return false;
    }
    return true;
  }

  private getAuth0Language() {
    const locale = this.translate.currentLang;
    let result = 'en';
    if (locale != null) {
      if (locale.indexOf('zh-Hans') > -1) {
        result = 'zh';
      } else if (locale.indexOf('zh-Hant') > -1) {
        result = 'zh-tw';
      }
    }
    this.log.info(`set auth0 lang based on ${locale} to ${result}`);
    return result;
  }

  private handleAuthResult(auth0WebAuth: any, authResult: any, err: any) {
    if (err) {
      this.log.error(err);
      throw err;
    }

    if (authResult && authResult.accessToken && authResult.idToken) {
      this.showLoading();
      this.setSession(authResult);

      auth0WebAuth.client.userInfo(this.accessToken, (err2, profile) => {
        if (err2) {
          console.error(`${JSON.stringify(err2)}`);
          this.router.navigateByUrl('/home');
        }

        this.zone.run(() => {
          localStorage.setItem('profile', JSON.stringify(profile));
          this.userProfile = profile;
          this.redirectAfterLogin();
        });
      });
    }
  }

  private redirectAfterLogin() {
    this.storage.get(this.navigationRequestKey).then((request) => {
      if (request != null) {
        this.storage.set(this.navigationRequestKey, null);
        this.router.navigateByUrl(request.destination);
      } else {
        this.memberService.getProfile().subscribe((_m) => {
          this.navigationService.openMemberHome();
        });
      }
    });
  }

  private clearCache() {
    this.manageVocabHistoryService.clearCache();
  }

  async showLoading() {
    const loading = await this.loadingController.create({
      message: this.translate.instant('Loading') + '...',
      duration: 2000
    });
    loading.present();
    return loading;
  }

}
