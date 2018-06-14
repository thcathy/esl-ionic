import {ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed} from "@angular/core/testing";
import {IonicModule, NavController, ToastController} from "ionic-angular";
import {TranslateModule} from "@ngx-translate/core";
import {AccountPage} from "./account";
import {of} from "rxjs/observable/of";
import {member1} from "../../../test-config/test-data";
import {MemberService} from "../../providers/member/member.service";
import {FormsModule} from "@angular/forms";
import {GoogleAnalyticsSpy, NavMock} from "../../../test-config/mocks-ionic";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

describe('AccountPage', () => {
  let fixture: ComponentFixture<AccountPage>;
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
        FormsModule
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: MemberService, useValue: memberService},
        ToastController,
        { provide: NavController, useValue: NavMock },
        { provide: GoogleAnalytics, useValue: GoogleAnalyticsSpy() }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AccountPage);
    pageElement = fixture.debugElement.nativeElement;
  });



  it('should show user information in html', fakeAsync(() => {
    fixture.detectChanges();
    let input = pageElement.querySelector('#userIdInput input') as HTMLInputElement;
    expect(input.value).toEqual('tester1');
    expect(getProfileSpy.calls.any()).toBe(true);
  }));
});
