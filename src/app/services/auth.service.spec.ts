import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {AuthService} from '@auth0/auth0-angular';
import {LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {NGXLogger} from 'ngx-logger';
import {of} from 'rxjs';
import {FFSAuthService} from './auth.service';
import {AppService} from './app.service';
import {ManageVocabHistoryService} from './member/manage-vocab-history.service';
import {MemberService} from './member/member.service';
import {NavigationService} from './navigation.service';
import {StorageService} from './storage.service';
import {Member} from '../entity/member';
import {Name} from '../entity/name';

describe('FFSAuthService', () => {
  let service: FFSAuthService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let memberServiceSpy: jasmine.SpyObj<MemberService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let appServiceSpy: jasmine.SpyObj<AppService>;
  let loggerSpy: jasmine.SpyObj<NGXLogger>;

  beforeEach(() => {
    localStorage.clear();

    authServiceSpy = jasmine.createSpyObj('AuthService',
      ['loginWithRedirect', 'handleRedirectCallback', 'getAccessTokenSilently'],
      {
        error$: of(null),
        idTokenClaims$: of({
          __raw:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3Mjg3MjYyMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          sub: '1234567890',
          name: 'John Doe',
          email: 'john@example.com',
          iat: 1516239022,
          exp: 1728726200
        }),
        user$: of({
          sub: '1234567890',
          name: 'John Doe',
          email: 'john@example.com'
        })
      }
    );
    authServiceSpy.handleRedirectCallback.and.returnValue(of({ appState: null }));
    authServiceSpy.getAccessTokenSilently.and.returnValue(of('mock-access-token'));
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    storageSpy.get.and.returnValue(Promise.resolve(null));

    memberServiceSpy = jasmine.createSpyObj('MemberService', ['getProfile']);
    const mockMember = new Member(1, 'auth0|123456', new Name('Doe', 'John'));
    memberServiceSpy.getProfile.and.returnValue(of(mockMember));

    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['openMemberHome', 'setParam']);
    appServiceSpy = jasmine.createSpyObj('AppService', ['isApp', 'isCapacitor']);
    loggerSpy = jasmine.createSpyObj('NGXLogger', ['info', 'warn', 'error', 'debug']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant'], {
      currentLang: 'en'
    });
    const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const manageVocabHistorySpy = jasmine.createSpyObj('ManageVocabHistoryService', ['clearCache']);

    TestBed.configureTestingModule({
      providers: [
        FFSAuthService,
        { provide: AppService, useValue: appServiceSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: MemberService, useValue: memberServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ManageVocabHistoryService, useValue: manageVocabHistorySpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NGXLogger, useValue: loggerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(FFSAuthService);
  });

  describe('handleAuthCallbackCapacitor', () => {
    it('should set session with tokens, profile and update service instance variables', async () => {
      appServiceSpy.isApp.and.returnValue(true);
      const callbackUrl = 'myapp://auth0/callback?code=test123&state=abc';

      await service.handleAuthCallbackCapacitor(callbackUrl);

      expect(localStorage.getItem('access_token')).toBe('mock-access-token');

      const idToken = localStorage.getItem('id_token');
      expect(idToken).toContain('eyJ'); // JWT starts with eyJ

      const profile = JSON.parse(localStorage.getItem('profile'));
      expect(profile).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        email: 'john@example.com'
      });

      expect(service.idToken).toBeTruthy();
      expect(service.accessToken).toBe('mock-access-token');
      expect(service.userProfile).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should check token expiration by decoding id token and return appropriate result', () => {
      // Case 1: Valid token with future expiration (exp: 1728726200 = Oct 12, 2024)
      const futureToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI3Mjg3MjYyMDB9.fakesignature';
      localStorage.setItem('id_token', futureToken);
      expect(service.isAuthenticated()).toBe(true);

      // Case 2: Valid token with past expiration
      const pastToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.fakesignature';
      localStorage.setItem('id_token', pastToken);
      expect(service.isAuthenticated()).toBe(false);

      // Case 3: No token
      localStorage.removeItem('id_token');
      expect(service.isAuthenticated()).toBe(false);

      // Case 4: Null token
      localStorage.setItem('id_token', null);
      expect(service.isAuthenticated()).toBe(false);

      // Case 5: Invalid token format - should return false
      localStorage.setItem('id_token', 'invalid-token');
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all tokens from localStorage, reset instance variables, and navigate to home', () => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('id_token', 'test-id-token');
      service.accessToken = 'test-token';
      service.userProfile = { name: 'Test' };

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('id_token')).toBeNull();
      expect(service.accessToken).toBeNull();
      expect(service.userProfile).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
