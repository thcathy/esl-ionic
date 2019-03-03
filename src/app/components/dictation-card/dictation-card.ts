import {Component, Input} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TranslateService} from '@ngx-translate/core';
import {AlertController, ToastController} from '@ionic/angular';
import {NavigationService} from '../../services/navigation.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {MemberDictationService} from '../../services/dictation/member-dictation.service';
import {Router} from '@angular/router';

@Component({
  selector: 'dictation-card',
  templateUrl: 'dictation-card.html',
  styleUrls: ['dictation-card.scss'],
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
  @Input() start = false;
  @Input() retry = false;
  @Input() edit = false;
  @Input() showContent = true;
  recommendState = 'normal';

  constructor(public router: Router,
              public navService: NavigationService,
              public dictationService: DictationService,
              public memberDictationService: MemberDictationService,
              public translate: TranslateService,
              public alertController: AlertController,
              public toastController: ToastController, ) {}

  highlightRecommend() {
    this.recommendState = 'highlight';
  }

  recommendAnimationDone(): void {
    this.recommendState = 'normal';
  }

  async confirmDeleteDictation() {
    const alert = await this.alertController.create({
      header: `${this.translate.instant('Confirm')}!`,
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

    await alert.present();
  }

  openSearchByIdPopup() {
    this.presentAlert(`${this.translate.instant('You can use the ID number to search this dictation')}`, null);
  }

  deleteDictation = () => {
    this.memberDictationService.deleteDictation(this.dictation.id)
      .subscribe(this.afterDelete, this.failDelete);
  }

  afterDelete = (d) => {
    console.info(`deleted dictation id: ${d.id}`);
    this.presentToast(this.translate.instant('DeletedDictation', {title: d.title}));
    this.navService.openMemberHome('dictation');
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  failDelete = (err) => {
    console.warn(`Cannot delete dictation: ${err}`);
    this.presentAlert(`${this.translate.instant('Error')}!`, this.translate.instant('Fail to delete dictation'));
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [this.translate.instant('OK')]
    });
    await alert.present();
  }
}
