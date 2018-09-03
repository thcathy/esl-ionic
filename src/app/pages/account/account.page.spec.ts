import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';

import { AccountPage } from './account.page';
import {member1} from "../../../test-config/test-data";
import {Observable} from "rxjs/Observable";
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {
  AlertControllerSpy, LoadingControllerSpy,
  PlatformSpy,
  SplashScreenSpy,
  StatusBarSpy,
  StorageSpy, ToastControllerSpy
} from "../../../test-config/mocks-ionic";
import {Storage} from "@ionic/storage";
import {AlertController, LoadingController, Platform, ToastController} from "@ionic/angular";
import {SplashScreen} from "@ionic-native/splash-screen/ngx";
import {StatusBar} from "@ionic-native/status-bar/ngx";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedTestModule} from "../../../test-config/shared-test.module";
import {MemberService} from "../../services/member/member.service";

describe('AccountPage', () => {
  let component: AccountPage;
  let fixture: ComponentFixture<AccountPage>;
  let pageElement: HTMLElement;
  let getProfileSpy;

  beforeEach(async(() => {
    const memberService = jasmine.createSpyObj('MemberService', ['getProfile']);
    getProfileSpy = memberService.getProfile.and.returnValue(Observable.of(member1));

    TestBed.configureTestingModule({
      declarations: [ AccountPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MemberService, useValue: memberService},
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPage);
    component = fixture.componentInstance;
    pageElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show user information in html', fakeAsync(() => {
    component.ionViewDidEnter();
    fixture.detectChanges();
    let input = pageElement.querySelector('#userIdInput') as HTMLInputElement;
    expect(input.value).toEqual('tester1');
    expect(getProfileSpy.calls.any()).toBe(true);
  }));
});
