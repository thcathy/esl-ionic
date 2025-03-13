import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, Input, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {AlertController, IonModal, ToastController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Dictation, Dictations} from '../../entity/dictation';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {AppService} from '../../services/app.service';
import {DictationHelper} from '../../services/dictation/dictation-helper.service';
import {MemberDictationService} from '../../services/dictation/member-dictation.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {NavigationService} from '../../services/navigation.service';
import {ShareService} from '../../services/share.service';
import {ArticleDictationOptionsComponent} from "../article-dictation-options/article-dictation-options.component";

@Component({
    selector: 'app-dictation-card',
    templateUrl: 'dictation-card.html',
    styleUrls: ['dictation-card.scss'],
    animations: [
        trigger('recommend', [
            state('highlight', style({ backgroundColor: 'transparent' })),
            transition('normal => highlight', [
                animate('1s ease-out', style({
                    backgroundColor: '#A7C713',
                    color: '#ffffff'
                })),
                animate('1s ease-in', style({ backgroundColor: '#ffffff' }))
            ])
        ])
    ],
    standalone: false
})
export class DictationCardComponent {
  @Input() dictation: Dictation;
  @Input() start = false;
  @Input() edit = false;
  @Input() showContent = true;

  @ViewChild('articleOptionsModal') articleDictationOptionsModal: IonModal;
  @ViewChild('articleDictationOptions') articleDictationOptions: ArticleDictationOptionsComponent;

  recommendState = 'normal';
  share = false;
  dictationUrl: string;

  constructor(public router: Router,
              public navService: NavigationService,
              public appService: AppService,
              public dictationHelper: DictationHelper,
              public manageVocabHistoryService: ManageVocabHistoryService,
              public memberDictationService: MemberDictationService,
              public translate: TranslateService,
              public alertController: AlertController,
              public toastController: ToastController,
              public componentService: IonicComponentService,
              public shareService: ShareService) {}

  get sourceType() { return Dictations.Source; }
  get memberVocabularies() { return this.dictation.vocabs.map(v => v.word).map(w => this.manageVocabHistoryService.findMemberVocabulary(w)); }

  highlightRecommend() {
    this.recommendState = 'highlight';
  }

  recommendAnimationDone($event): void {
    this.recommendState = 'normal';
  }

  async confirmDeleteDictation() {
    const alert = await this.alertController.create({
      header: `${this.translate.instant('Confirm')}!`,
      message: `${this.translate.instant('Delete this exercise')}?`,
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
    if (d.source === Dictations.Source.Select) {
      this.navService.openMemberHome('vocabulary');
    } else {
      this.navService.openMemberHome('dictation');
    }
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
    console.warn(`Cannot delete exercise: ${err}`);
    this.presentAlert(`${this.translate.instant('Error')}!`, this.translate.instant('Fail to delete exercise'));
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
    this.shareService.shareDictation(this.dictation);
  }

  startArticleDictation() {
    this.articleDictationOptionsModal.dismiss();
    this.dictation.options = this.dictation.options || new Dictations.Options();
    this.dictation.options.caseSensitiveSentence = this.articleDictationOptions.caseSensitive.checked;
    this.dictation.options.checkPunctuation = this.articleDictationOptions.checkPunctuation.checked;
    this.dictation.options.speakPunctuation= this.articleDictationOptions.speakPunctuation.checked;
    this.navService.startDictation(this.dictation);
  }

  showDictationOptions() {
    if (this.dictationHelper.isSentenceDictation(this.dictation)) {
      this.articleDictationOptionsModal.present();
    } else {
      this.componentService.presentVocabPracticeTypeActionSheet()
        .then(type => this.startVocabDictation(type));
    }
  }

  startVocabDictation(type: VocabPracticeType) {
    this.dictation.options = { 'practiceType' : type };
    this.navService.startDictation(this.dictation);
  }

}
