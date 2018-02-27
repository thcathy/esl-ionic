import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {MemberDictationService} from "../../providers/dictation/member-dictation.service";
import {Dictation} from "../../entity/dictation";
import {TranslateService} from "@ngx-translate/core";

@IonicPage()
@Component({
  selector: 'page-member-home',
  templateUrl: 'member-home.html',
})
export class MemberHomePage {
  createdDictations: Array<Dictation>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public memberDictationService: MemberDictationService,
    public translateService: TranslateService
  ) {
    let loader = this.loadingCtrl.create({ content: translateService.instant('Please wait') + "..." });
    loader.present();

    memberDictationService.getAllDictation().subscribe(dictations => {
      loader.dismissAll();
      this.createdDictations = dictations;
    });
  }

}
