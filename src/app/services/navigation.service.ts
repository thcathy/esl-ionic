import {Injectable} from '@angular/core';

import {Dictation} from "../entity/dictation";
import {DictationService} from "./dictation/dictation.service";
import {convertToParamMap, Router} from "@angular/router";
import {Storage} from "@ionic/storage";
import {VocabPracticeHistory} from "../entity/vocab-practice-history";
import {SentenceHistory} from "../entity/sentence-history";
import {Location} from "@angular/common";

export interface NavigationRequest {
  destination: any;
  params: any;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public static storageKeys = {
    dictation: 'dictation',
    dictationId: 'dictationId',
    editDictation: 'editDictation',
    histories: 'histories',
    historyStored: 'historyStored',
    mark: 'mark',
    toastMessage: 'toastMessage',
    showBackButton: 'showBackButton',
  };

  constructor(private router: Router,
              private location: Location,
              private storage: Storage,
              private dictationService: DictationService)
  {}

  openHomePage() { this.navigate('/home') ;}
  openAccountPage() { this.navigate('/account') }
  openInstantDictation() { this.navigate('/instant-dictation') }
  openSearchDictation() { this.navigate('/search-dictation') }
  openMemberHome() { this.navigate('/member-home') }
  openVocabularyStarter() { this.navigate('/vocabulary-starter') }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  goTo(request: NavigationRequest) {
    this.router.navigate([request.destination]);
  }

  goBack() {
    this.location.back();
  }

  async startDictation(dictation: Dictation) {
    await this.storage.set(NavigationService.storageKeys.dictationId, dictation.id);
    this.storage.set(NavigationService.storageKeys.dictation, dictation).then(() => {
      if (this.dictationService.isSentenceDictation(dictation)) {
        this.router.navigate(['/article-dictation']);
      } else {
        this.router.navigate(['/dictation-practice']);
      }
    });
  }

  retryDictation(dictation: Dictation) {
    if (this.dictationService.isInstantDictation(dictation))
      this.openInstantDictation();
    else
      this.startDictation(dictation);
  }

  async openDictation(dictation: Dictation, toastMessage: string = null, showBackButton: boolean = false) {
    await this.storage.set(NavigationService.storageKeys.dictationId, dictation.id);
    await this.storage.set(NavigationService.storageKeys.toastMessage, toastMessage);
    await this.storage.set(NavigationService.storageKeys.showBackButton, showBackButton);
    this.storage.set(NavigationService.storageKeys.dictation, dictation)
      .then(() => this.router.navigate(['/dictation-view']));
  }

  pushOpenDictation(dictation: Dictation, toastMessage: string = null) {
    this.openDictation(dictation, toastMessage, true);
  }

  async editDictation(dictation: Dictation = null) {
    await this.storage.set(NavigationService.storageKeys.editDictation, dictation);
    return await this.router.navigate(['/edit-dictation']);
  }

  async practiceComplete(dictation: Dictation, mark: number, histories: VocabPracticeHistory[], historyStored: boolean = false) {
    await this.storage.set(NavigationService.storageKeys.dictation, dictation);
    await this.storage.set(NavigationService.storageKeys.histories, histories);
    await this.storage.set(NavigationService.storageKeys.mark, mark);
    await this.storage.set(NavigationService.storageKeys.historyStored, historyStored);
    return await this.router.navigate(['/practice-complete']);
  }

  openFunFunSpell() {
    window.open('https://www.funfunspell.com/', '_system');
  }

  async articleDictationComplete(dictation: Dictation, histories: SentenceHistory[], historyStored: boolean = false) {
    await this.storage.set(NavigationService.storageKeys.dictation, dictation);
    await this.storage.set(NavigationService.storageKeys.histories, histories);
    await this.storage.set(NavigationService.storageKeys.historyStored, historyStored);
    return await this.router.navigate(['/article-dictation-complete']);
  }
}
