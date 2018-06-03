import {Component, Input} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {AlertController, NavController, ToastController} from "ionic-angular";
import {NavigationService} from "../../providers/navigation.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {DictationService} from "../../providers/dictation/dictation.service";
import {TranslateService} from "@ngx-translate/core";
import {MemberDictationService} from "../../providers/dictation/member-dictation.service";
import {MemberHomePage} from "../../pages/member-home/member-home";

@Component({
  selector: 'dictation-card',
  templateUrl: 'dictation-card.html',
  animations: [
    trigger('recommend', [
      state('highlight', style({backgroundColor: 'transparent'})),
      transition('normal => highlight', [
        animate('1s ease-out',
          style({
            backgroundColor: '#4ab948',
            color: '#ffffff'
          })
        ),
        animate('1s ease-in', style({backgroundColor: '#ffffff'}))
      ])
    ])
  ]
})
export class DictationCardComponent {
  @Input() dictation: Dictation;
  @Input() start: boolean = false;
  @Input() retry: boolean = false;
  @Input() edit: boolean = false;
  @Input() showContent: boolean = true;
  recommendState: string = 'normal';

  constructor(public navCtrl: NavController,
              public navService: NavigationService,
              public dictationService: DictationService,
              public memberDictationService: MemberDictationService,
              public translate: TranslateService,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,)
  {}

  highlightRecommend() {
    this.recommendState = 'highlight';
  }

  recommendAnimationDone() : void {
    this.recommendState = 'normal';
  }

  checkDeleteDictation() {
    let alert = this.alertCtrl.create({
      title: `${this.translate.instant('Confirm')}!`,
      message: `${this.translate.instant('Delete this dictation')}?`,
      buttons: [
        {
          text: this.translate.instant('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('OK'),
          handler: this.deleteDictation
        }
        ]
    });
    alert.present();
  }

  deleteDictation = () => {
    this.memberDictationService.deleteDictation(this.dictation.id)
      .subscribe(this.afterDelete, this.failDelete);
  }

  afterDelete = (d) => {
    console.info(`deleted dictation id: ${d.id}`);
    let toast = this.toastCtrl.create({
      message: this.translate.instant('DeletedDictation', {title: d.title}),
      duration: 3000,
      position: 'top'
    });
    toast.present();
    this.navCtrl.setRoot(MemberHomePage);
  }

  failDelete = (err) => {
    console.warn(`Cannot delete dictation: ${err}`);
    let alert = this.alertCtrl.create({
      title: `${this.translate.instant('Error')}!`,
      message: this.translate.instant('Fail to delete dictation'),
      buttons: [this.translate.instant('OK')]
    });
    alert.present();
  }
}
