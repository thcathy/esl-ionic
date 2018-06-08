import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  fakeAsync,
  TestBed, tick
} from "@angular/core/testing";
import {IonicModule, NavController, ToastController} from "ionic-angular";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {HttpLoaderFactory} from "../../app/app.module";
import {AccountPage} from "./account";
import {of} from "rxjs/observable/of";
import {member1} from "../../../test-config/test-data";
import {MemberService} from "../../providers/member/member.service";
import {FormBuilder} from "@angular/forms";
import {NavMock} from "../../../test-config/mocks-ionic";
import {asyncData} from "../../testing/async-observable-helpers";

describe('AccountPage', () => {
  let fixture: ComponentFixture<AccountPage>;
  let component: AccountPage;
  let pageElement: HTMLElement;
  let getProfileSpy;

  beforeEach(() => {
    const memberService = jasmine.createSpyObj('MemberService', ['getProfile']);
    getProfileSpy = memberService.getProfile.and.returnValue(of(member1));

    TestBed.configureTestingModule({
      declarations: [ AccountPage ],
      imports: [
        IonicModule.forRoot(AccountPage),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: MemberService, useValue: memberService},
        FormBuilder,
        ToastController,
        { provide: NavController, useValue: NavMock }
      ]
    });
    fixture = TestBed.createComponent(AccountPage);
    component = fixture.componentInstance;
    pageElement = fixture.debugElement.nativeElement;
  });

  it('should show user information in html', fakeAsync(() => {
    fixture.detectChanges();
    expect(pageElement.querySelector('#userIdInput input').value).toEqual('tester1');
    expect(getProfileSpy.calls.any()).toBe(true);
  }));
});
