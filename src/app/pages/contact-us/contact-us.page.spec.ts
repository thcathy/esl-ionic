import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';
import {of, Subject, throwError} from 'rxjs';

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
  let translate: TranslateService;

  beforeEach(waitForAsync(() => {
    feedback = jasmine.createSpyObj('FeedbackService', ['submit']);
    feedback.submit.and.returnValue(of(undefined));
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
    translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture = TestBed.createComponent(ContactUsPage);
    component = fixture.componentInstance;
    spyOn(component, 'reachLocales').and.returnValue(['en-HK']);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('requires a message and checks email format only when an address is entered', () => {
    component.channel.setValue('email');
    component.submit();
    expect(feedback.submit).not.toHaveBeenCalled();
    expect(component.email.errors).toBeNull();
    expect(component.message.errors.required).toBeTrue();

    component.message.setValue('Hello there');
    component.submit();
    expect(feedback.submit).toHaveBeenCalledOnceWith({message: 'Hello there'});

    feedback.submit.calls.reset();
    component.message.setValue('Hello there');
    component.email.setValue('not-an-email');
    component.submit();
    expect(component.email.errors.email).toBeTrue();
    expect(feedback.submit).not.toHaveBeenCalled();
  });

  it('sends a message with no contact, and sends a contact when one is entered', () => {
    expect(component.selectedChannel).toBe('email');
    expect(component.channels).toEqual(['whatsapp', 'email', 'wechat', 'messenger']);

    component.message.setValue('Hello there');
    component.submit();
    expect(component.contact.errors).toBeNull();
    expect(feedback.submit).toHaveBeenCalledOnceWith({message: 'Hello there'});

    feedback.submit.calls.reset();
    component.message.setValue('Hello there');
    component.channel.setValue('wechat');
    component.contact.setValue('not-an-email');
    component.submit();
    expect(feedback.submit).toHaveBeenCalledOnceWith({
      channel: 'wechat',
      contact: 'not-an-email',
      message: 'Hello there',
    });
  });

  it('treats a blank Messenger name as no contact', () => {
    component.channel.setValue('messenger');
    component.contact.setValue('   ');
    component.message.setValue('Hello there');

    component.submit();

    expect(feedback.submit).toHaveBeenCalledOnceWith({message: 'Hello there'});
  });

  it('reorders the list when the language changes and keeps a channel the learner already chose', () => {
    component.channel.setValue('messenger');
    component.channel.markAsDirty();
    component.contact.setValue('Jane Lee');

    translate.use('zh-Hans');

    expect(component.channels).toEqual(['wechat', 'email', 'whatsapp', 'messenger']);
    expect(component.selectedChannel).toBe('messenger');
    expect(component.contact.value).toBe('Jane Lee');
  });

  it('reorders the list with the language and keeps Email selected until the learner picks a channel', () => {
    expect(component.selectedChannel).toBe('email');

    translate.use('zh-Hans');

    expect(component.channels[0]).toBe('wechat');
    expect(component.selectedChannel).toBe('email');
  });

  it('lists WeChat first when the app language is Simplified Chinese and still selects Email', () => {
    translate.use('zh-Hans');
    component.ionViewWillEnter();
    expect(component.channels).toEqual(['wechat', 'email', 'whatsapp', 'messenger']);
    expect(component.selectedChannel).toBe('email');
  });

  it('selects Email and prefills the login email, and keeps an edited address', () => {
    auth.userProfile = {email: 'learner@example.com'};
    component.ionViewWillEnter();
    expect(component.selectedChannel).toBe('email');
    expect(component.email.value).toBe('learner@example.com');

    component.email.setValue('parent@example.com');
    component.ionViewWillEnter();
    expect(component.email.value).toBe('parent@example.com');
    expect(component.selectedChannel).toBe('email');
  });

  it('keeps a chosen channel when the page is entered again and still prefills an empty email', () => {
    component.channel.setValue('messenger');
    component.channel.markAsDirty();
    auth.userProfile = {email: 'learner@example.com'};

    component.ionViewWillEnter();

    expect(component.selectedChannel).toBe('messenger');
    expect(component.email.value).toBe('learner@example.com');
    expect(component.email.errors).toBeNull();
  });

  it('posts the chosen channel and trimmed contact, confirms, and leaves the page', () => {
    const pending = new Subject<void>();
    feedback.submit.and.returnValue(pending.asObservable());
    component.channel.setValue('whatsapp');
    component.contact.setValue('  +852 9123 4567  ');
    component.message.setValue('  Hello there  ');

    component.submit();
    component.submit();

    expect(feedback.submit).toHaveBeenCalledOnceWith({
      channel: 'whatsapp',
      contact: '+852 9123 4567',
      message: 'Hello there',
    });
    pending.next();
    expect(ionic.showToastMessage).toHaveBeenCalledOnceWith('ContactUs.Sent');
    expect(navigation.goBack).toHaveBeenCalled();
    expect(component.message.value).toBe('');
    expect(component.submitting).toBeFalse();
  });

  it('shows the reach-you select and only the field for the selected channel', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('ion-select')?.label).toBe('ContactUs.ReachYou');
    expect(Array.from(root.querySelectorAll('ion-select-option'), option => option.textContent?.trim())).toEqual([
      'ContactUs.Channel.WhatsApp',
      'ContactUs.Channel.Email',
      'ContactUs.Channel.WeChat',
      'ContactUs.Channel.Messenger',
    ]);
    expect(root.querySelector('.hint-text')?.textContent?.trim()).toBe('ContactUs.ContactOptional');
    expect(root.querySelector('ion-input')?.label).toBe('Email');
    expect(root.querySelector('ion-input[formcontrolname="contact"]')).toBeNull();
  });

  it('keeps the form and does not claim success when sending fails', () => {
    feedback.submit.and.returnValue(throwError(() => new Error('offline')));
    component.channel.setValue('email');
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
    component.channel.setValue('messenger');
    component.contact.setValue('Jane Lee');
    component.message.setValue('Hello there');
    component.submit();
    component.ionViewWillLeave();

    pending.next();

    expect(ionic.showToastMessage).toHaveBeenCalledOnceWith('ContactUs.Sent');
    expect(navigation.goBack).not.toHaveBeenCalled();
  });
});
