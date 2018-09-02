import { Component, OnInit } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MemberService, UpdateMemberRequest} from "../../services/member/member.service";
import {Member} from "../../entity/member";
import {IonicComponentService} from "../../services/ionic-component.service";

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  inputForm: FormGroup;
  member: Member;

  constructor(
    public memberService: MemberService,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public ionicComponentService: IonicComponentService,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  get firstName() { return this.inputForm.get('firstName'); }
  get lastName() { return this.inputForm.get('lastName'); }
  get birthday() { return this.inputForm.get('birthday'); }
  get address() { return this.inputForm.get('address'); }
  get phoneNumber() { return this.inputForm.get('phoneNumber'); }
  get school() { return this.inputForm.get('school'); }

  ionViewDidEnter() {
    this.memberService.getProfile().subscribe((m) => {
      console.log(`member: ${JSON.stringify(m)}`);
      this.member = m;
      this.setFormValue(m);
    });
  }

  setFormValue(member: Member) {
    this.firstName.setValue(member.name.firstName);
    this.lastName.setValue(member.name.lastName);
    this.birthday.setValue(new Date(member.birthday).toISOString());
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
      birthday: this.birthday.value ? new Date(this.birthday.value) : null,
      phoneNumber: this.phoneNumber.value,
      school: this.school.value
    }).subscribe(
      _m => this.ionicComponentService.showToastMessage(this.translate.instant('Personal information updated')),
      _e => this.ionicComponentService.showToastMessage(this.translate.instant('Error when update personal information'))
    )
  }

}
