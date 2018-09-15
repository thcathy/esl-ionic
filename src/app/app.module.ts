import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy, Routes } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {IonicStorageModule} from "@ionic/storage";
import {ComponentsModule} from "./components/components.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {CommonModule} from "@angular/common";
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from "@angular/common/http";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {ReactiveFormsModule} from "@angular/forms";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {PipesModule} from "./pipes/pipes.module";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {library} from "@fortawesome/fontawesome-svg-core";
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import {NavigationService} from "./services/navigation.service";
import {RankingService} from "./services/ranking/ranking.service";
import {DictationService} from "./services/dictation/dictation.service";
import {MemberDictationService} from "./services/dictation/member-dictation.service";
import {VocabPracticeService} from "./services/practice/vocab-practice.service";
import {MemberService} from "./services/member/member.service";
import {SpeechService} from "./services/speech.service";
import {AuthService} from "./services/auth.service";
import {DisplayService} from "./services/display.service";
import {ServerService} from "./services/server.service";
import {PracticeHistoryService} from "./services/dictation/practice-history.service";
import {ArticleDictationService} from "./services/dictation/article-dictation.service";
import {IonicComponentService} from "./services/ionic-component.service";
import {IdTokenInterceptor} from "./interceptor/IdTokenInterceptor";
import {TextToSpeech} from "@ionic-native/text-to-speech/ngx";
import {InAppBrowser} from "@ionic-native/in-app-browser/ngx";
import {MemberHomePageModule} from "./pages/member-home/member-home.module";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

library.add(fas, far);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    BrowserAnimationsModule, CommonModule, HttpClientModule, ReactiveFormsModule,
    IonicStorageModule.forRoot(),
    FontAwesomeModule,
    PipesModule, ComponentsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MemberHomePageModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    NavigationService, RankingService,
    DictationService, VocabPracticeService, MemberDictationService, MemberService, SpeechService,
    AuthService,
    DisplayService,
    ServerService,
    ArticleDictationService,
    TextToSpeech, InAppBrowser,
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
