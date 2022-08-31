import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Browser } from '@capacitor/browser';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { firstValueFrom } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AppService } from './app.service';
import { ManageVocabHistoryService } from './member/manage-vocab-history.service';
import { MemberService } from './member/member.service';
import { NavigationRequest, NavigationService } from './navigation.service';
import { StorageService } from './storage.service';

const tokenTimeoutSecond = 35000;
const auth0CallbackUri = '/auth0-callback';

@Injectable({ providedIn: 'root' })
export class FFSAuthService {
  userProfile: any;
  idTokenKey = 'id_token';
  expiresAtKey = 'expires_at';
  accessTokenKey = 'access_token';
  navigationRequestKey = 'navigation_request';
  accessToken: string;
  idToken: string;

  constructor(public zone: NgZone,
              protected appService: AppService,
              public storage: StorageService,
              public translate: TranslateService,
              public memberService: MemberService,
              public navigationService: NavigationService,
              public manageVocabHistoryService: ManageVocabHistoryService,
              public loadingController: LoadingController,
              private router: Router,
              private log: NGXLogger,
              public auth: AuthService,
  ) {
    try {
      this.userProfile = JSON.parse(localStorage.getItem('profile'));
      this.idToken = localStorage.getItem(this.idTokenKey);
      this.accessToken = localStorage.getItem(this.accessTokenKey);
    } catch (e) {
      localStorage.setItem(this.idTokenKey, null);
    }
    
    auth.error$.subscribe((error) => console.log(`Auth: ${error}`));
  }

  public login(redirectRequest?: NavigationRequest): void {
    this.storage.set(this.navigationRequestKey, redirectRequest);
    this.clearCache();
    if (this.appService.isApp()) {
      this.loginCapacitor();
    } else {
      this.loginWeb();
    }
  }

  private loginWeb(signUp=false) {
    this.auth.loginWithRedirect({
      ui_locales: this.getAuth0Language(),
      screen_hint: signUp ? 'signup' : 'login',
      redirect_uri: window.location.origin + auth0CallbackUri,
    });
  }

  public signUp(): void {
    if (this.appService.isApp()) {
      this.loginCapacitor(true);
    } else {
      this.loginWeb(true);
    }
  }

  public async handleAuthCallbackCapacitor(url: string) {
    if (url.includes('state=') && (url.includes('error=') || url.includes('code='))) {
      console.log(`handle auth callback by capacitor`);
      await firstValueFrom(this.auth.handleRedirectCallback(url));
      const idToken = await firstValueFrom(this.auth.idTokenClaims$);
      const profile = await firstValueFrom(this.auth.user$);
      const accessToken = await firstValueFrom(this.auth.getAccessTokenSilently());
      this.setSession(accessToken, idToken.__raw);
      localStorage.setItem('profile', JSON.stringify(profile));
      
      this.closeBrowserIfNeeded();
      this.redirectAfterLogin();
    } else {
      console.error(`Cannot process callback: ${url}`);
      this.closeBrowserIfNeeded();
    }
  }

  private closeBrowserIfNeeded() {
    if (this.appService.isApp()) {
      Browser.close();
    }
  }

  public handleAuthCallbackWeb(): void {
    this.log.info('handle auth callback: web:' + window.location.href);
    if (window.location.href.includes(auth0CallbackUri)) {
      this.handleAuthCallbackCapacitor(window.location.href);
    }
  }

  public loginCapacitor(signUp = false) {
    this.auth
      .buildAuthorizeUrl({
        ui_locales: this.getAuth0Language(),
        screen_hint: signUp ? 'signup' : 'login'
      })
      .pipe(mergeMap((url) => Browser.open({ url, windowName: '_self' })))
      .subscribe();
  }

  private setSession(accessToken: string, idToken: string) {
    this.log.info('login session: update session');
    const expiresAt = JSON.stringify(tokenTimeoutSecond * 1000 + new Date().getTime());
    localStorage.setItem(this.expiresAtKey, expiresAt);
    this.log.info(`token expiresAt: ${expiresAt}`);

    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.idTokenKey, idToken);
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

  private redirectAfterLogin() {
    this.storage.get(this.navigationRequestKey).then((request: NavigationRequest) => {
        this.memberService.getProfile().subscribe((_m) => {
          if (request != null) {
            this.storage.set(this.navigationRequestKey, null);
            if (request.params != null) {
              Object.getOwnPropertyNames(request.params).forEach(key => this.navigationService.setParam(key, request.params[key]));
            }
            this.router.navigateByUrl(request.destination);
          } else {
            this.navigationService.openMemberHome();
          }
        });
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
