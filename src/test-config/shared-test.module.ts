import { CommonModule } from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  AlertController,
  IonicModule,
  LoadingController, NavController,
  Platform,
  ToastController
} from "@ionic/angular";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {TranslateModule} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {StatusBar} from "@ionic-native/status-bar/ngx";
import {SplashScreen} from "@ionic-native/splash-screen/ngx";
import {Storage} from "@ionic/storage";
import {
  AlertControllerSpy, LoadingControllerSpy,
  PlatformSpy,
  SplashScreenSpy,
  StatusBarSpy,
  StorageSpy, ToastControllerSpy
} from "./mocks-ionic";
import {ComponentsModule} from "../app/components/components.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  imports:      [
    RouterTestingModule.withRoutes([]),
    HttpClientTestingModule,
    TranslateModule.forRoot(),
    CommonModule,
    FormsModule, ReactiveFormsModule, IonicModule, NoopAnimationsModule,
    ComponentsModule,
  ],
  declarations: [ ],
  exports:      [
    CommonModule, FormsModule, ReactiveFormsModule, NoopAnimationsModule,
    TranslateModule, IonicModule,
    ComponentsModule,
  ]
})
export class SharedTestModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedTestModule,
      providers: [
        { provide: StatusBar, useValue: StatusBarSpy() },
        { provide: SplashScreen, useValue: SplashScreenSpy() },
        { provide: Platform, useValue: PlatformSpy() },
        { provide: Storage, useValue: StorageSpy() },
        { provide: AlertController, useValue: AlertControllerSpy()},
        { provide: LoadingController, useValue: LoadingControllerSpy()},
        { provide: ToastController, useValue: ToastControllerSpy()},
        NavController,
      ]
    };
  }
}
