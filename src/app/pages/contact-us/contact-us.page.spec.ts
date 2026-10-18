import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Subject, throwError} from 'rxjs';

import {ContactUsPage} from './contact-us.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {FeedbackService} from '../../services/feedback.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NavigationService} from '../../services/navigation.service';
import {FFSAuthService} from '../../services/auth.service';

describe('ContactUsPage', () => {
  let component: ContactUsPage;
  let fixture: ComponentFixture<ContactUsPage>;
  let feedback: jasmine.SpyObj<FeedbackService>;
  let navigation: jasmine.SpyObj<NavigationService>;
  let ionic: jasmine.SpyObj<IonicComponentService>;
  let auth: {userProfile: {email?: string} | null};

  beforeEach(waitForAsync(() => {
    feedback = jasmine.createSpyObj('FeedbackService', ['submit']);
    navigation = jasmine.createSpyObj('NavigationService', ['goBack']);
    ionic = jasmine.createSpyObj('IonicComponentService', ['showToastMessage']);
    auth = {userProfile: null};

    TestBed.configureTestingModule({
      declarations: [ContactUsPage],
      imports: [SharedTestModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: FeedbackService, useValue: feedback},
        {provide: NavigationService, useValue: navigation},
        {provide: IonicComponentService, useValue: ionic},
        {provide: FFSAuthService, useValue: auth},
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires a valid email and a message', () => {
    component.submit();
    expect(feedback.submit).not.toHaveBeenCalled();
    expect(component.email.errors.required).toBeTrue();
    expect(component.message.errors.required).toBeTrue();

    component.email.setValue('not-an-email');
    component.message.setValue('   ');
    component.submit();
    expect(component.email.errors.email).toBeTrue();
    expect(component.message.errors.required).toBeTrue();
    expect(feedback.submit).not.toHaveBeenCalled();
  });

  it('prefills the signed-in email and keeps an edited address', () => {
    auth.userProfile = {email: 'learner@example.com'};
    component.ionViewWillEnter();
    expect(component.email.value).toBe('learner@example.com');

    component.email.setValue('parent@example.com');
    component.ionViewWillEnter();
    expect(component.email.value).toBe('parent@example.com');
  });

  it('posts trimmed fields, confirms, and leaves the page', () => {
    const pending = new Subject<void>();
    feedback.submit.and.returnValue(pending.asObservable());
    component.email.setValue('  learner@example.com  ');
    component.message.setValue('  Hello there  ');

    component.submit();
    component.submit();

    expect(feedback.submit).toHaveBeenCalledOnceWith({
      email: 'learner@example.com',
      message: 'Hello there',
    });
    pending.next();
    expect(ionic.showToastMessage).toHaveBeenCalledOnceWith('ContactUs.Sent');
    expect(navigation.goBack).toHaveBeenCalled();
    expect(component.message.value).toBe('');
    expect(component.submitting).toBeFalse();
  });

  it('keeps the form and does not claim success when sending fails', () => {
    feedback.submit.and.returnValue(throwError(() => new Error('offline')));
    component.email.setValue('learner@example.com');
    component.message.setValue('Hello there');

    component.submit();

    expect(ionic.showToastMessage).toHaveBeenCalledOnceWith('ContactUs.Failed');
    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(component.message.value).toBe('Hello there');
    expect(component.submitting).toBeFalse();
  });

  it('does not leave again when the page is already closed', () => {
    const pending = new Subject<void>();
    feedback.submit.and.returnValue(pending.asObservable());
    component.email.setValue('learner@example.com');
    component.message.setValue('Hello there');
    component.submit();
    component.ionViewWillLeave();

    pending.next();

    expect(ionic.showToastMessage).toHaveBeenCalledOnceWith('ContactUs.Sent');
    expect(navigation.goBack).not.toHaveBeenCalled();
  });
});
