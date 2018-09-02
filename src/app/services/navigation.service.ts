import {Injectable} from '@angular/core';

import {Dictation} from "../entity/dictation";
import {DictationService} from "./dictation/dictation.service";
import {Router} from "@angular/router";
import {Storage} from "@ionic/storage";
import {VocabPracticeHistory} from "../entity/vocab-practice-history";
import {SentenceHistory} from "../entity/sentence-history";

export interface NavigationRequest {
  destination: any;
  params: any;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public static storageKeys = {
    dictation: 'dictation',
    dictationId: 'dictationId',
    histories: 'histories',
  };

  constructor(private router: Router,
              private storage: Storage,
              private dictationService: DictationService)
  {}

  openHomePage() { this.navigate('/home') ;}
  openAccountPage() { this.navigate('/account') }
  openInstantDictation() { this.navigate('/instant-dictation') }
  openSearchDictation() { this.navigate('/search-dictation') }
  openMemberHome() { this.navigate('/member-home') }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  goTo(request: NavigationRequest) {
    this.router.navigate([request.destination], { queryParams: request.params });
  }

  startDictation(dictation: Dictation) {
    this.storage.set(NavigationService.storageKeys.dictation, dictation).then(() => {
      if (this.dictationService.isSentenceDictation(dictation)) {
        this.router.navigate(['/article-dictation']);
      } else {
        this.router.navigate(['/dictation-practice'], {
          queryParams: {
            dictationId: dictation.id
          }
        });
      }
    });
  }

  retryDictation(dictation: Dictation) {
    if (this.dictationService.isInstantDictation(dictation))
      this.openInstantDictation();
    else
      this.startDictation(dictation);
  }

  openDictation(dictation: Dictation, toastMessage: string = null) {
    this.storage.set(NavigationService.storageKeys.dictation, dictation)
      .then(() => {
        this.router.navigate(['/dictation-view'], {
          queryParams: {
            dictationId: dictation.id,
            toastMessage: toastMessage,
          }});
      });
  }

  pushOpenDictation(dictation: Dictation) {
    this.openDictation(dictation);
  }

  async editDictation(dictation: Dictation = null) {
    await this.storage.set(NavigationService.storageKeys.dictation, dictation);
    return await this.router.navigate(['/edit-dictation']);
  }

  async practiceComplete(dictation: Dictation, mark: number, histories: VocabPracticeHistory[], historyStored: boolean = false) {
    await this.storage.set(NavigationService.storageKeys.dictation, dictation);
    await this.storage.set(NavigationService.storageKeys.histories, histories);
    return await this.router.navigate(['/practice-complete'],{
      queryParams: {
        mark: mark,
        historyStored: historyStored,
      }
    });
  }

  openFunFunSpell() {
    window.open('https://www.funfunspell.com/', '_system');
  }

  async articleDictationComplete(dictation: Dictation, histories: SentenceHistory[], historyStored: boolean = false) {
    await this.storage.set(NavigationService.storageKeys.dictation, dictation);
    await this.storage.set(NavigationService.storageKeys.histories, histories);
    return await this.router.navigate(['/article-dictation-complete'], {
      queryParams: {
        historyStored: historyStored,
      }
    });
  }
}
