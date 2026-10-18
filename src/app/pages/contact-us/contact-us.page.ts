import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

import {FFSAuthService} from '../../services/auth.service';
import {FeedbackService} from '../../services/feedback.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NavigationService} from '../../services/navigation.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
  standalone: false
})
export class ContactUsPage implements OnInit {
  inputForm: UntypedFormGroup;
  submitting = false;
  private viewActive = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private feedbackService: FeedbackService,
    private authService: FFSAuthService,
    private ionicComponentService: IonicComponentService,
    private translate: TranslateService,
    private navigationService: NavigationService,
  ) {}

  ngOnInit() {
    this.inputForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]],
    });
  }

  ionViewWillEnter() {
    this.viewActive = true;
    this.prefillEmail();
  }

  ionViewWillLeave() {
    this.viewActive = false;
  }

  get email() { return this.inputForm.get('email'); }
  get message() { return this.inputForm.get('message'); }
  get emailInvalid() { return this.email.invalid && (this.email.dirty || this.email.touched); }
  get messageInvalid() { return this.message.invalid && (this.message.dirty || this.message.touched); }

  submit() {
    if (this.submitting) {
      return;
    }
    this.email.setValue((this.email.value ?? '').trim());
    this.message.setValue((this.message.value ?? '').trim());
    if (this.inputForm.invalid) {
      this.inputForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.feedbackService.submit({
      email: this.email.value,
      message: this.message.value,
    }).subscribe({
      next: () => this.onSent(),
      error: () => this.onFailed(),
    });
  }

  private prefillEmail() {
    const profileEmail = this.authService.userProfile?.email;
    if (profileEmail && !this.email.value) {
      this.email.setValue(profileEmail);
    }
  }

  private onSent() {
    this.submitting = false;
    this.message.setValue('');
    this.message.markAsPristine();
    this.message.markAsUntouched();
    this.ionicComponentService.showToastMessage(this.translate.instant('ContactUs.Sent'));
    if (this.viewActive) {
      this.navigationService.goBack();
    }
  }

  private onFailed() {
    this.submitting = false;
    this.ionicComponentService.showToastMessage(this.translate.instant('ContactUs.Failed'));
  }
}
