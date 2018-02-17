import { Component } from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {CreateDictationRequest, MemberDictationService} from "../../providers/dictation/member-dictation.service";
import {Dictation} from "../../entity/dictation";
import {NavigationService} from "../../providers/navigation.service";
import {Loading} from "ionic-angular/components/loading/loading";

@IonicPage()
@Component({
  selector: 'page-edit-dictation',
  templateUrl: 'edit-dictation.html',
})
export class EditDictationPage {
  inputForm: FormGroup;
  loader: Loading;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public formBuilder: FormBuilder,
              public memberDictationService: MemberDictationService,
              public navService: NavigationService,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
  ) {
    this.createForm();
  }

  get title() { return this.inputForm.get('title'); }
  get now() { return new Date(); }
  get description() { return this.inputForm.get('description'); }
  get vocabulary() { return this.inputForm.get('vocabulary'); }
  get showImage() { return this.inputForm.get('showImage'); }
  get suitableStudent() { return this.inputForm.get('suitableStudent'); }

  createForm() {
    this.inputForm = this.formBuilder.group({
      'title': new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(50)]),
      'description': new FormControl('', [Validators.maxLength(100)]),
      'showImage': true,
      'vocabulary': new FormControl('', [Validators.required, maxVocabularyValidator(50)]),
      'suitableStudent': 'Any',
    });
  }

  createDictation() {
    this.loader = this.loadingCtrl.create({ content: "Please wait..." });
    this.memberDictationService.createDictation(<CreateDictationRequest>{
      title: this.title.value,
      description: this.description.value,
      showImage: this.showImage.value,
      vocabulary: this.vocabulary.value.split(/[\s,]+/),
      suitableStudent: this.suitableStudent.value
    }).subscribe(
      dic => this.viewDictation(dic),
        err => this.showError(err)
    );
  }

  viewDictation(dictation: Dictation) {
    this.navService.openDictation(dictation);
  }

  showError(err: string) {
    this.loader.dismissAll();
    let alert = this.alertCtrl.create({
      title: 'Cannot create dictation',
      subTitle: err,
      buttons: ['OK']
    });
    alert.present();
  }

}

export function maxVocabularyValidator(max: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const tooLarge = control.value.split(/[\s,]+/).length > max;
    return tooLarge ? {'maxVocabulary': {value: control.value}} : null;
  };
}
