import { Component } from '@angular/core';

import {AlertController, NavController, ToastController} from 'ionic-angular';

import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MemberService, UpdateMemberRequest} from "../../providers/member/member.service";
import {Member} from "../../entity/member";
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  inputForm: FormGroup;
  member: Member;

  constructor(
    public nav: NavController,
    public memberService: MemberService,
    public formBuilder: FormBuilder,
    public toastCtrl: ToastController,
    public translate: TranslateService,
  ) {
    this.createForm();
    this.memberService.getProfile().subscribe((m) => {
      this.member = m;
      this.setFormValue(m);
    });
  }

  get firstName() { return this.inputForm.get('firstName'); }
  get lastName() { return this.inputForm.get('lastName'); }
  get birthday() { return new Date(this.inputForm.get('birthday')); }
  get address() { return this.inputForm.get('address'); }
  get phoneNumber() { return this.inputForm.get('phoneNumber'); }
  get school() { return this.inputForm.get('school'); }

  setFormValue(member: Member) {
    this.firstName.setValue(member.name.firstName);
    this.lastName.setValue(member.name.lastName);
    this.birthday.setValue(member.birthday);
    this.address.setValue(member.address);
    this.phoneNumber.setValue(member.phoneNumber);
    this.school.setValue(member.school);
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'firstName': new FormControl('', [Validators.maxLength(50)]),
      'lastName': new FormControl('', [Validators.maxLength(50)]),
      'birthday': '',
      'address': new FormControl('', [Validators.maxLength(200)]),
      'phoneNumber': new FormControl('', [Validators.maxLength(20), Validators.pattern("^[0-9]*$")]),
      'school': new FormControl('', [Validators.maxLength(100)]),
    });
  }

  save() {
    this.memberService.update(<UpdateMemberRequest>{
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      address: this.address.value,
      birthday: this.birthday.value ? new Date(this.birthday.value).getTime() : null,
      phoneNumber: this.phoneNumber.value,
      school: this.school.value
    }).subscribe(
      _m => this.showToast('Personal information updated'),
      _e => this.showToast('Error when update personal information')
    )
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: this.translate.instant(message),
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
