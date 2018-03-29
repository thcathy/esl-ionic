import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpModule} from "@angular/http";

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicStorageModule } from '@ionic/storage';

import { ConferenceApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { PopoverPage } from '../pages/about-popover/about-popover';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { SchedulePage } from '../pages/schedule/schedule';
import { ScheduleFilterPage } from '../pages/schedule-filter/schedule-filter';
import { SessionDetailPage } from '../pages/session-detail/session-detail';
import { SignupPage } from '../pages/signup/signup';
import { SpeakerDetailPage } from '../pages/speaker-detail/speaker-detail';
import { SpeakerListPage } from '../pages/speaker-list/speaker-list';
import { TabsPage } from '../pages/tabs-page/tabs-page';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';

import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
import {HomePage} from "../pages/home/home";
import {AppService} from "../providers/app.service";
import {RankingService} from "../providers/ranking/ranking.service";
import {ComponentsModule} from "../components/components.module";
import {DictationService} from "../providers/dictation/dictation.service";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {DictationViewPage} from "../pages/dictation-view/dictation-view";
import {VocabPracticeService} from "../providers/practice/vocab-practice.service";
import {DictationPracticePage} from "../pages/dictation-practice/dictation-practice";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {IdTokenInterceptor} from "./interceptor/IdTokenInterceptor";
import {HttpErrorInterceptor} from "./interceptor/HttpErrorInterceptor";
import {PracticeCompletePage} from "../pages/practice-complete/practice-complete";
import {NavigationService} from "../providers/navigation.service";
import {InstantDictationPage} from "../pages/instant-dictation/instant-dictation";
import {ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../providers/auth.service";
import {EditDictationPage} from "../pages/edit-dictation/edit-dictation";
import {MemberDictationService} from "../providers/dictation/member-dictation.service";
import {MemberHomePage} from "../pages/member-home/member-home";
import {ServerService} from "../providers/server.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {DisplayService} from "../providers/display.service";
import {TextToSpeech} from "@ionic-native/text-to-speech";
import {MemberService} from "../providers/member/member.service";
import {PipesModule} from "../pipes/pipes.module";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    ConferenceApp,
    AboutPage,
    AccountPage,
    LoginPage,
    MapPage,
    PopoverPage,
    SchedulePage,
    ScheduleFilterPage,
    SessionDetailPage,
    SignupPage,
    SpeakerDetailPage,
    SpeakerListPage,
    TabsPage,
    TutorialPage,
    SupportPage,
    HomePage,
    DictationViewPage,
    DictationPracticePage,
    PracticeCompletePage,
    InstantDictationPage,
    EditDictationPage,
    MemberHomePage,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(ConferenceApp, {}, {
      links: [
        { component: TabsPage, name: 'TabsPage', segment: 'tabs-page' },
        { component: SchedulePage, name: 'Schedule', segment: 'schedule' },
        { component: SessionDetailPage, name: 'SessionDetail', segment: 'sessionDetail/:sessionId' },
        { component: ScheduleFilterPage, name: 'ScheduleFilter', segment: 'scheduleFilter' },
        { component: SpeakerListPage, name: 'SpeakerList', segment: 'speakerList' },
        { component: SpeakerDetailPage, name: 'SpeakerDetail', segment: 'speakerDetail/:speakerId' },
        { component: MapPage, name: 'Map', segment: 'map' },
        { component: AboutPage, name: 'About', segment: 'about' },
        { component: TutorialPage, name: 'Tutorial', segment: 'tutorial' },
        { component: SupportPage, name: 'SupportPage', segment: 'support' },
        { component: LoginPage, name: 'LoginPage', segment: 'login' },
        { component: AccountPage, name: 'AccountPage', segment: 'account' },
        { component: SignupPage, name: 'SignupPage', segment: 'signup' },
        { component: HomePage, name: 'HomePage', segment: 'home'},
        { component: DictationViewPage, name: 'DictationViewPage', segment: 'dictation-view/:dictationId'},
        { component: DictationPracticePage, name: 'DictationPracticePage', segment: 'dictation-practice/:dictationId'},
        { component: InstantDictationPage, name: 'InstantDictationPage', segment: 'instant-dictation'},
        { component: EditDictationPage, name: 'EditDictationPage', segment: 'edit-dictation'},
        { component: MemberHomePage, name: 'MemberHomePage', segment: 'member-home'}
      ]
    }),
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ComponentsModule,
    ReactiveFormsModule,
    PipesModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ConferenceApp,
    AboutPage,
    AccountPage,
    LoginPage,
    MapPage,
    PopoverPage,
    SchedulePage,
    ScheduleFilterPage,
    SessionDetailPage,
    SignupPage,
    SpeakerDetailPage,
    SpeakerListPage,
    TabsPage,
    TutorialPage,
    SupportPage,
    HomePage,
    DictationViewPage,
    DictationPracticePage,
    PracticeCompletePage,
    InstantDictationPage,
    EditDictationPage,
    MemberHomePage,
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConferenceData,
    UserData,
    InAppBrowser,
    SplashScreen,
    AppService,
    NavigationService,
    RankingService,
    DictationService,
    VocabPracticeService,
    MemberDictationService,
    MemberService,
    AuthService,
    DisplayService,
    ServerService,
    GoogleAnalytics,
    TextToSpeech,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: IdTokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
  ]
})
export class AppModule { }
