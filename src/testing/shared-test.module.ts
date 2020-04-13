import { CommonModule } from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  AlertController,
  IonicModule,
  LoadingController, NavController,
  Platform,
  ToastController
} from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {Storage} from '@ionic/storage';
import {
  AlertControllerSpy, GoogleAnalyticsSpy, LoadingControllerSpy, NavigationServiceSpy, NGXLoggerSpy,
  SplashScreenSpy,
  StatusBarSpy,
  StorageSpy, TextToSpeechSpy, ToastControllerSpy,
} from './mocks-ionic';
import {ComponentsModule} from '../app/components/components.module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';
import {GoogleAnalytics} from '@ionic-native/google-analytics/ngx';
import {AppService} from '../app/services/app.service';
import {NGXLogger} from 'ngx-logger';
import {NavigationService} from '../app/services/navigation.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {FontAwesomeIconsModule} from '../app/fontawesome-icons.module';

@NgModule({
  imports:      [
    RouterTestingModule.withRoutes([]),
    HttpClientTestingModule,
    TranslateModule.forRoot(),
    CommonModule,
    FormsModule, ReactiveFormsModule, NoopAnimationsModule,
    ComponentsModule,
    IonicModule.forRoot(),
    FontAwesomeIconsModule,
  ],
  declarations: [ ],
  exports:      [
    CommonModule, FormsModule, ReactiveFormsModule, NoopAnimationsModule,
    TranslateModule, IonicModule,
    ComponentsModule,
    FontAwesomeIconsModule,
  ]
})
export class SharedTestModule {
  static forRoot(): ModuleWithProviders<SharedTestModule> {
    return {
      ngModule: SharedTestModule,
      providers: [
        { provide: StatusBar, useValue: StatusBarSpy() },
        { provide: SplashScreen, useValue: SplashScreenSpy() },
        { provide: Storage, useValue: StorageSpy() },
        { provide: AlertController, useValue: AlertControllerSpy()},
        { provide: LoadingController, useValue: LoadingControllerSpy()},
        { provide: ToastController, useValue: ToastControllerSpy()},
        { provide: TextToSpeech, useValue: TextToSpeechSpy()},
        { provide: GoogleAnalytics, useValue: GoogleAnalyticsSpy()},
        { provide: NGXLogger, useValue: NGXLoggerSpy()},
        { provide: NavigationService, useValue: NavigationServiceSpy()},
        AppService,
        NavController,
        Platform,
        SocialSharing,
        Deeplinks,
      ]
    };
  }
}
