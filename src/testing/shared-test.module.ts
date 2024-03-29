import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SplashScreen } from '@capacitor/splash-screen';
import {
  AlertController,
  IonicModule,
  LoadingController, NavController,
  Platform,
  ToastController
} from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NGXLogger } from 'ngx-logger';
import { ComponentsModule } from '../app/components/components.module';
import { FontAwesomeIconsModule } from '../app/fontawesome-icons.module';
import { PipesModule } from '../app/pipes/pipes.module';
import { AppService } from '../app/services/app.service';
import { DictationHelper } from '../app/services/dictation/dictation-helper.service';
import { NavigationService } from '../app/services/navigation.service';
import { StorageService } from '../app/services/storage.service';
import {
  AlertControllerSpy, LoadingControllerSpy, NavigationServiceSpy, NGXLoggerSpy,
  SplashScreenSpy,
  StorageSpy, ToastControllerSpy, FFSAuthServiceSpy
} from './mocks-ionic';
import { AuthService } from '@auth0/auth0-angular';
import { FFSAuthService } from '../app/services/auth.service';

@NgModule({
  imports:      [
    RouterTestingModule.withRoutes([]),
    HttpClientTestingModule,
    TranslateModule.forRoot(),
    CommonModule,
    FormsModule, ReactiveFormsModule, NoopAnimationsModule,
    ComponentsModule,
    IonicModule.forRoot(),
    FontAwesomeIconsModule, PipesModule,
  ],
  declarations: [ ],
  exports:      [
    CommonModule, FormsModule, ReactiveFormsModule, NoopAnimationsModule,
    TranslateModule, IonicModule,
    ComponentsModule,
    FontAwesomeIconsModule, PipesModule,
  ]
})
export class SharedTestModule {
  static forRoot(): ModuleWithProviders<SharedTestModule> {
    return {
      ngModule: SharedTestModule,
      providers: [
        { provide: SplashScreen, useValue: SplashScreenSpy() },
        { provide: StorageService, useValue: StorageSpy() },
        { provide: AlertController, useValue: AlertControllerSpy()},
        { provide: LoadingController, useValue: LoadingControllerSpy()},
        { provide: ToastController, useValue: ToastControllerSpy()},
        { provide: FFSAuthService, useValue: FFSAuthServiceSpy()},
        { provide: NGXLogger, useValue: NGXLoggerSpy()},
        { provide: NavigationService, useValue: NavigationServiceSpy()},
        DictationHelper,
        AppService,
        NavController,
        Platform,
      ]
    };
  }
}
