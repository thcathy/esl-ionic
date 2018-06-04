import { Component } from '@angular/core';

import { AlertController, NavController } from 'ionic-angular';

import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MemberService} from "../../providers/member/member.service";
import {Member} from "../../entity/member";
import {maxVocabularyValidator} from "../edit-dictation/edit-dictation";


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
    this.memberService.getProfile().subscribe((m) => this.member = m);
  }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'title': new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]),
      'description': new FormControl('', [Validators.maxLength(100)]),
      'showImage': true,
      'vocabulary': new FormControl('', [maxVocabularyValidator(50), Validators.pattern("^([a-zA-Z ]+[\\-,]?)+")]),
      'article': '',
      'type': 'word',
      'suitableStudent': 'Any',
    });
    this.inputForm.get('suitableStudent').setValue('Any');
  }

}
