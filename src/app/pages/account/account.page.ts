import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MemberService, UpdateMemberRequest} from '../../services/member/member.service';
import {Member} from '../../entity/member';
import {IonicComponentService} from '../../services/ionic-component.service';
import {NGXLogger} from 'ngx-logger';
import {Observable} from 'rxjs';
import {CanComponentDeactivate} from '../../guards/can-deactivate.guard';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit, CanComponentDeactivate {
  inputForm: FormGroup;
  member: Member;

  constructor(
    public memberService: MemberService,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public ionicComponentService: IonicComponentService,
    public route: ActivatedRoute,
    private log: NGXLogger,
  ) { }

  ngOnInit() {
    this.createForm();
    this.route.data
      .subscribe((data: { member: Member }) => {
        this.member = data.member;
        this.setFormValue(data.member);
      });
  }

  get firstName() { return this.inputForm.get('firstName'); }
  get lastName() { return this.inputForm.get('lastName'); }
  get birthday() { return this.inputForm.get('birthday'); }
  get address() { return this.inputForm.get('address'); }
  get phoneNumber() { return this.inputForm.get('phoneNumber'); }
  get school() { return this.inputForm.get('school'); }

  ionViewDidEnter() {}

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
      'phoneNumber': new FormControl('', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]),
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
      m => this.afterSave(m),
      _e => this.ionicComponentService.showToastMessage(this.translate.instant('Error when update personal information'))
    );
  }

  afterSave(newMember: Member) {
    this.inputForm.reset();
    this.setFormValue(newMember);
    this.ionicComponentService.showToastMessage(this.translate.instant('Personal information updated'));
    this.member = newMember;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.inputForm || !this.inputForm.dirty) {
      return true;
    }
    return this.ionicComponentService.confirmExit();
  }
}
