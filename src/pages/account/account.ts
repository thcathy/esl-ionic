import { Component } from '@angular/core';

import { AlertController, NavController } from 'ionic-angular';

import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MemberService} from "../../providers/member/member.service";
import {Member} from "../../entity/member";


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  inputForm: FormGroup;
  member: Member;

  constructor(
    public alertCtrl: AlertController,
    public nav: NavController,
    public memberService: MemberService,
    public formBuilder: FormBuilder,
  ) {
    this.createForm();
    this.memberService.getProfile().subscribe((m) => {
      this.member = m;
      this.setFormValue(m);
    });
  }

  get firstName() { return this.inputForm.get('firstName'); }
  get lastName() { return this.inputForm.get('lastName'); }
  get birthday() { return this.inputForm.get('birthday'); }
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
      'address': new FormControl('', [Validators.maxLength(500)]),
      'phoneNumber': new FormControl('', [Validators.maxLength(20)]),
      'school': new FormControl('', [Validators.maxLength(200)]),
    });
  }

  save() {

  }

}
