import {Injectable} from '@angular/core';

import {Dictation} from '../entity/dictation';
import {DictationService} from './dictation/dictation.service';
import {NavigationExtras, Router} from '@angular/router';
import {Storage} from '@ionic/storage';
import {VocabPracticeHistory} from '../entity/vocab-practice-history';
import {SentenceHistory} from '../entity/sentence-history';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {EditDictationPageMode} from '../pages/edit-dictation/edit-dictation-page-enum';

export interface NavigationRequest {
  destination: any;
  params: { [key: string]: any; };
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
    memberHomeSegment: 'memberHomeSegment',
    language: 'language',
  };

  params = {};

  constructor(private router: Router,
              private location: Location,
              private storage: Storage,
              private dictationService: DictationService,
              private translate: TranslateService) {}


  getParam(key: string) {
    return this.params[key];
  }

  setParam(key: string, object: any) {
    this.params[key] = object;
  }

  openHomePage() { this.navigate('/home') ; }
  openAccountPage() { this.navigate('/account'); }
  openSearchDictation() { this.navigate('/search-dictation'); }
  openVocabularyStarter() { this.navigate('/vocabulary-starter'); }

  navigate(path: string, queryParams = {}) {
    this.router.navigate([path], { queryParams: queryParams });
  }

  goTo(request: NavigationRequest) {
    this.router.navigate([request.destination]);
  }

  goBack() {
    this.location.back();
  }

  async startDictation(dictation: Dictation) {
    // await this.storage.set(NavigationService.storageKeys.dictationId, dictation.id);
    this.storage.set(NavigationService.storageKeys.dictation, dictation).then(() => {
      if (this.dictationService.isSentenceDictation(dictation)) {
        this.router.navigate(['/article-dictation']);
      } else {
        this.router.navigate(['/dictation-practice']);
      }
    });
  }

  openMemberHome(segment: String = 'dictation') {
    this.navigate(`/member-home/${segment}`);
  }

  retryDictation(dictation: Dictation) {
    if (this.dictationService.isInstantDictation(dictation)) {
      // this.openInstantDictation();
      this.editDictation(dictation, EditDictationPageMode.Start);
    } else {
      this.startDictation(dictation);
    }
  }

  openDictation(dictation: Dictation, toastMessage: string = null, showBackButton: boolean = false) {
    const navigationExtras: NavigationExtras = {
      state: {
        dictation: JSON.stringify(dictation),
        toastMessage: toastMessage,
        showBackButton: showBackButton
      }
    };
    return this.router.navigate(['/dictation-view'], navigationExtras);
  }

  pushOpenDictation(dictation: Dictation, toastMessage: string = null) {
    this.openDictation(dictation, toastMessage, true);
  }

  editDictation(dictation: Dictation = null, mode: string = 'Edit') {
    // await this.storage.set(NavigationService.storageKeys.editDictation, dictation);
    this.setParam(NavigationService.storageKeys.editDictation, dictation);
    return this.router.navigate(['/edit-dictation/' + mode]);
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

  openContactUs() {
    window.open(this.translate.instant('ContactUsUrl'), '_system');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.storage.set(NavigationService.storageKeys.language, lang);
  }
}
