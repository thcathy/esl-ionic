import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Dictation, Dictations} from '../../entity/dictation';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {DictationHelper} from '../../services/dictation/dictation-helper.service';
import {MemberDictationService} from '../../services/dictation/member-dictation.service';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {NavigationService} from '../../services/navigation.service';
import {ShareService} from '../../services/share.service';
import {UIOptionsService} from '../../services/ui-options.service';
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
export class DictationCardComponent implements OnInit {
  @Input() dictation: Dictation;
  @Input() start = false;
  @Input() edit = false;
  @Input() showContent = true;
  @Input() showStartButton = true;
  @Input() showOptions = true;

  @ViewChild('articleDictationOptions') articleDictationOptions: ArticleDictationOptionsComponent;

  recommendState = 'normal';
  selectedStartPracticeType: VocabPracticeType = VocabPracticeType.Spell;
  selectedVoiceMode = UIOptionsService.voiceMode.online;
  constructor(public navService: NavigationService,
              public dictationHelper: DictationHelper,
              public manageVocabHistoryService: ManageVocabHistoryService,
              public memberDictationService: MemberDictationService,
              public uiOptionsService: UIOptionsService,
              public translate: TranslateService,
              public alertController: AlertController,
              public toastController: ToastController,
              public shareService: ShareService) {}

  get sourceType() { return Dictations.Source; }
  get practiceType() { return VocabPracticeType; }
  get memberVocabularies() { return this.dictation.vocabs.map(v => v.word).map(w => this.manageVocabHistoryService.findMemberVocabulary(w)); }

  async ngOnInit() {
    const [savedVoiceMode, savedPracticeType] = await Promise.all([
      this.uiOptionsService.loadOption(UIOptionsService.keys.ttsVoiceMode),
      this.uiOptionsService.loadOption(UIOptionsService.keys.vocabPracticeType),
    ]);
    this.selectedVoiceMode = this.resolveVoiceMode(savedVoiceMode);
    this.selectedStartPracticeType = this.resolvePracticeType(
      this.dictation?.options?.practiceType || savedPracticeType
    );
  }

  highlightRecommend() {
    this.recommendState = 'highlight';
  }

  recommendAnimationDone(_event): void {
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
    const updated = this.prepareStartDictation(this.dictation, this.selectedStartPracticeType);
    this.navService.startDictation(updated);
  }

  startVocabDictation(type: VocabPracticeType) {
    const updated = this.prepareStartDictation(this.dictation, type);
    this.navService.startDictation(updated);
  }

  onVoiceModeChange(mode: string) {
    this.selectedVoiceMode = this.resolveVoiceMode(mode);
    this.uiOptionsService.saveOption(UIOptionsService.keys.ttsVoiceMode, this.selectedVoiceMode);
  }

  getSelectedPracticeType(): VocabPracticeType {
    return this.resolvePracticeType(this.selectedStartPracticeType);
  }

  prepareStartDictation(dictation: Dictation, practiceType?: VocabPracticeType): Dictation {
    const resolvedType = this.resolvePracticeType(practiceType ?? this.selectedStartPracticeType);
    this.selectedStartPracticeType = resolvedType;
    this.persistStartOptions(resolvedType);

    dictation.options = {
      ...(dictation.options || {}),
      practiceType: resolvedType,
    };

    if (this.dictationHelper.isSentenceDictation(dictation) && this.articleDictationOptions) {
      dictation.options.caseSensitiveSentence = this.articleDictationOptions.caseSensitive.checked;
      dictation.options.checkPunctuation = this.articleDictationOptions.checkPunctuation.checked;
      dictation.options.speakPunctuation = this.articleDictationOptions.speakPunctuation.checked;
    }
    return dictation;
  }

  private persistStartOptions(practiceType?: VocabPracticeType) {
    this.uiOptionsService.saveOption(UIOptionsService.keys.ttsVoiceMode, this.selectedVoiceMode);
    if (practiceType) {
      this.uiOptionsService.saveOption(UIOptionsService.keys.vocabPracticeType, practiceType);
    }
  }

  private resolveVoiceMode(mode: string): string {
    return mode === UIOptionsService.voiceMode.local
      ? UIOptionsService.voiceMode.local
      : UIOptionsService.voiceMode.online;
  }

  private resolvePracticeType(type: VocabPracticeType): VocabPracticeType {
    return type === VocabPracticeType.Puzzle ? VocabPracticeType.Puzzle : VocabPracticeType.Spell;
  }

}
