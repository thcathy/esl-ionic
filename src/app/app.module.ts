import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {LoggerModule} from 'ngx-logger';

import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi, withJsonpSupport} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {IonicStorageModule} from '@ionic/storage-angular';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FontAwesomeIconsModule} from './fontawesome-icons.module';
import {IdTokenInterceptor} from './interceptor/IdTokenInterceptor';
import {AuthErrorInterceptor} from './interceptor/AuthErrorInterceptor';
import {MemberHomePageModule} from './pages/member-home/member-home.module';
import {FFSAuthService} from './services/auth.service';
import {ArticleDictationService} from './services/dictation/article-dictation.service';
import {DictationHelper} from './services/dictation/dictation-helper.service';
import {DictationService} from './services/dictation/dictation.service';
import {MemberDictationService} from './services/dictation/member-dictation.service';
import {PracticeHistoryService} from './services/dictation/practice-history.service';
import {IonicComponentService} from './services/ionic-component.service';
import {MemberService} from './services/member/member.service';
import {NavigationService} from './services/navigation.service';
import {VocabPracticeService} from './services/practice/vocab-practice.service';
import {RankingService} from './services/ranking/ranking.service';
import {ServerService} from './services/server.service';
import {SpeechService} from './services/speech.service';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {AuthModule} from '@auth0/auth0-angular';
import config from '../../capacitor.config';

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const auth0RedirectUri = `${config.appId}://${environment.auth0Host}/capacitor/${config.appId}/callback`;

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
        BrowserAnimationsModule, CommonModule, ReactiveFormsModule,
        IonicStorageModule.forRoot(),
        FontAwesomeIconsModule,
        AuthModule.forRoot({
            domain: "thcathy.auth0.com",
            clientId: "Q2x3VfMKsuKtmXuBbuwuTw3ARDZ1xpBS",
            authorizationParams: {
              redirect_uri: auth0RedirectUri,
              scope: 'openid profile email',
            },
            useRefreshTokens: true,
            useRefreshTokensFallback: false,
            cacheLocation: 'localstorage',
        }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        LoggerModule.forRoot(environment.logging),
        MemberHomePageModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })], providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        NavigationService, RankingService,
        DictationService, VocabPracticeService, MemberDictationService, MemberService, SpeechService,
        FFSAuthService,
        ServerService,
        ArticleDictationService,
        PracticeHistoryService, IonicComponentService,
        DictationHelper,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: IdTokenInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthErrorInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi(), withJsonpSupport()),
    ] })
export class AppModule {}
