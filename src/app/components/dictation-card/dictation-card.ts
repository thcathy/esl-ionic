import {Component, Input} from '@angular/core';
import {Dictation} from '../../entity/dictation';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TranslateService} from '@ngx-translate/core';
import {AlertController, PopoverController, ToastController} from '@ionic/angular';
import {NavigationService} from '../../services/navigation.service';
import {DictationService} from '../../services/dictation/dictation.service';
import {MemberDictationService} from '../../services/dictation/member-dictation.service';
import {Router} from '@angular/router';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {AppService} from '../../services/app.service';

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
  share = false;
  dictationUrl: string;

  constructor(public router: Router,
              public navService: NavigationService,
              public appService: AppService,
              public dictationService: DictationService,
              public memberDictationService: MemberDictationService,
              public translate: TranslateService,
              public alertController: AlertController,
              public toastController: ToastController,
              public socialSharing: SocialSharing) {}

  highlightRecommend() {
    this.recommendState = 'highlight';
  }

  recommendAnimationDone($event): void {
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
          handler: this.deleteDictation,
          cssClass: 'leave-button'
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
    console.log(`deleted dictation id: ${d.id}`);
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

  shareDictation() {
    this.dictationUrl = `https://www.funfunspell.com/link/dictation-view/${this.dictation.id}`;
    if (this.appService.isCordova()) {
      // this is the complete list of currently supported params you can pass to the plugin (all optional)
      const options = {
        message: `Dictation: ${this.dictation.title}`, // not supported on some apps (Facebook, Instagram)
        url: this.dictationUrl,
      };

      const onSuccess = function(result) {
        console.log('Share completed? ' + result.completed); // On Android apps mostly return false even while it's true
        console.log('Shared to app: ' + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      };

      const onError = function(msg) {
        console.log('Sharing failed with message: ' + msg);
      };

      this.socialSharing.shareWithOptions(options).then(onSuccess).catch(onError);
    } else {
      this.share = !this.share;
    }

  }
}
