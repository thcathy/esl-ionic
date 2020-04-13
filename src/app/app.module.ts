import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy} from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { LoggerModule} from 'ngx-logger';

import { FontAwesomeIconsModule } from './fontawesome-icons.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {IonicStorageModule} from '@ionic/storage';
import {ComponentsModule} from './components/components.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ReactiveFormsModule} from '@angular/forms';
import {PipesModule} from './pipes/pipes.module';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {NavigationService} from './services/navigation.service';
import {RankingService} from './services/ranking/ranking.service';
import {DictationService} from './services/dictation/dictation.service';
import {MemberDictationService} from './services/dictation/member-dictation.service';
import {VocabPracticeService} from './services/practice/vocab-practice.service';
import {MemberService} from './services/member/member.service';
import {SpeechService} from './services/speech.service';
import {AuthService} from './services/auth.service';
import {ServerService} from './services/server.service';
import {PracticeHistoryService} from './services/dictation/practice-history.service';
import {ArticleDictationService} from './services/dictation/article-dictation.service';
import {IonicComponentService} from './services/ionic-component.service';
import {IdTokenInterceptor} from './interceptor/IdTokenInterceptor';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {MemberHomePageModule} from './pages/member-home/member-home.module';
import {GoogleAnalytics} from '@ionic-native/google-analytics/ngx';
import { environment } from '../environments/environment';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {SafariViewController} from '@ionic-native/safari-view-controller/ngx';
import { ServiceWorkerModule } from '@angular/service-worker';
import {ShareButtonsModule} from 'ngx-sharebuttons/buttons';
import {ShareIconsModule} from 'ngx-sharebuttons/icons';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    BrowserAnimationsModule, CommonModule, HttpClientModule, HttpClientJsonpModule, ReactiveFormsModule,
    IonicStorageModule.forRoot(),
    FontAwesomeIconsModule,
    ShareButtonsModule.withConfig({
      debug: true
    }),
    ShareIconsModule.forRoot(),
    PipesModule, ComponentsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LoggerModule.forRoot(environment.logging),
    MemberHomePageModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Deeplinks, SocialSharing,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    NavigationService, RankingService,
    DictationService, VocabPracticeService, MemberDictationService, MemberService, SpeechService,
    AuthService,
    ServerService,
    ArticleDictationService,
    TextToSpeech, InAppBrowser, GoogleAnalytics,
    SafariViewController,
    PracticeHistoryService, IonicComponentService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: IdTokenInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
