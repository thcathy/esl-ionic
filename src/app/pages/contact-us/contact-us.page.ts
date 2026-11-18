import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

import {FFSAuthService} from '../../services/auth.service';
import {ContactChannel, contactChannelsFor} from '../../services/contact-channel';
import {FeedbackService} from '../../services/feedback.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NavigationService} from '../../services/navigation.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
  standalone: false
})
export class ContactUsPage implements OnInit, OnDestroy {
  inputForm: UntypedFormGroup;
  channels: ContactChannel[] = contactChannelsFor(null, []);
  submitting = false;
  private viewActive = true;
  private channelSub?: Subscription;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly feedbackService: FeedbackService,
    private readonly authService: FFSAuthService,
    private readonly ionicComponentService: IonicComponentService,
    private readonly translate: TranslateService,
    private readonly navigationService: NavigationService,
  ) {}

  ngOnInit() {
    this.inputForm = this.formBuilder.group({
      channel: ['email', Validators.required],
      email: [''],
      contact: [''],
      message: ['', Validators.required],
    });
    this.channelSub = new Subscription();
    this.channelSub.add(this.channel.valueChanges.subscribe(channel => this.applyChannelValidators(channel)));
    this.channelSub.add(this.translate.onLangChange.subscribe(() => this.syncReachDefaults()));
    this.syncReachDefaults();
  }

  ngOnDestroy() {
    this.channelSub?.unsubscribe();
  }

  ionViewWillEnter() {
    this.viewActive = true;
    this.syncReachDefaults();
  }

  ionViewWillLeave() {
    this.viewActive = false;
  }

  get channel() { return this.inputForm.get('channel'); }
  get email() { return this.inputForm.get('email'); }
  get contact() { return this.inputForm.get('contact'); }
  get message() { return this.inputForm.get('message'); }
  get selectedChannel(): ContactChannel { return this.channel.value as ContactChannel; }
  get emailInvalid() { return this.selectedChannel === 'email' && this.email.invalid && (this.email.dirty || this.email.touched); }
  get messageInvalid() { return this.message.invalid && (this.message.dirty || this.message.touched); }

  channelLabelKey(channel: ContactChannel): string {
    switch (channel) {
      case 'email': return 'ContactUs.Channel.Email';
      case 'whatsapp': return 'ContactUs.Channel.WhatsApp';
      case 'wechat': return 'ContactUs.Channel.WeChat';
      case 'messenger': return 'ContactUs.Channel.Messenger';
      default: {
        const unknown: never = channel;
        return unknown;
      }
    }
  }

  get contactLabelKey(): string {
    switch (this.selectedChannel) {
      case 'email': return 'Email';
      case 'whatsapp': return 'ContactUs.WhatsAppNumber';
      case 'wechat': return 'ContactUs.WeChatId';
      case 'messenger': return 'ContactUs.MessengerName';
      default: {
        const unknown: never = this.selectedChannel;
        return unknown;
      }
    }
  }

  submit() {
    if (this.submitting) {
      return;
    }
    const channel = this.selectedChannel;
    if (channel === 'email') {
      this.email.setValue((this.email.value ?? '').trim());
    } else {
      this.contact.setValue((this.contact.value ?? '').trim());
    }
    this.message.setValue((this.message.value ?? '').trim());
    if (this.inputForm.invalid) {
      this.inputForm.markAllAsTouched();
      return;
    }

    const contact = channel === 'email' ? this.email.value : this.contact.value;
    this.submitting = true;
    this.feedbackService.submit(contact
      ? {channel, contact, message: this.message.value}
      : {message: this.message.value}
    ).subscribe({
      next: () => this.onSent(),
      error: () => this.onFailed(),
    });
  }

  reachLocales(): string[] {
    if (typeof navigator !== 'undefined' && navigator.language?.trim()) {
      return [navigator.language];
    }
    const culture = this.translate.getBrowserCultureLang();
    return culture ? [culture] : [];
  }

  private syncReachDefaults() {
    this.channels = contactChannelsFor(this.translate.currentLang, this.reachLocales());
    const profileEmail = (this.authService.userProfile?.email ?? '').trim();
    if (profileEmail && !(this.email.value ?? '').trim()) {
      this.email.setValue(profileEmail);
    }
    if (this.channel.pristine) {
      this.channel.setValue('email', {emitEvent: false});
    }
    this.applyChannelValidators(this.channel.value);
  }

  private applyChannelValidators(channel: ContactChannel) {
    if (channel === 'email') {
      this.email.setValidators([Validators.email]);
    } else {
      this.email.clearValidators();
    }
    this.contact.clearValidators();
    this.email.updateValueAndValidity({emitEvent: false});
    this.contact.updateValueAndValidity({emitEvent: false});
  }

  private onSent() {
    this.submitting = false;
    this.message.setValue('');
    this.message.markAsPristine();
    this.message.markAsUntouched();
    void this.ionicComponentService.showToastMessage(this.translate.instant('ContactUs.Sent'));
    if (this.viewActive) {
      this.navigationService.goBack();
    }
  }

  private onFailed() {
    this.submitting = false;
    void this.ionicComponentService.showToastMessage(this.translate.instant('ContactUs.Failed'));
  }
}
