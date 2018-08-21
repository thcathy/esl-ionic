import {Injectable} from '@angular/core';

import {Dictation} from "../entity/dictation";
import {DictationService} from "./dictation/dictation.service";
import {Router} from "@angular/router";


export interface NavigationRequest {
  destination: any;
  params: any;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {

  constructor(private router: Router,
              public dictationService: DictationService)
  {}

  goTo(request: NavigationRequest) {
    this.router.navigate([request.destination], { queryParams: request.params });
  }

  startDictation(dictation: Dictation) {
    if (this.dictationService.isSentenceDictation(dictation)) {
      this.router.navigate(['/article-dictation'], { queryParams: { dictation: dictation } });
    } else {
      this.router.navigate(['/dictation-practice'], {
        queryParams: {
          dictation: dictation,
          dictationId: dictation.id
        }});
    }
  }

  retryDictation(dictation: Dictation) {
    if (this.dictationService.isInstantDictation(dictation))
      this.router.navigate(['/instant-dictation']);
    else
      this.startDictation(dictation);
  }


  openDictation(dictation: Dictation, toastMessage: string = null) {
    this.router.navigate(['/dictation-view'], {
      queryParams: {
        dictation: dictation,
        dictationId: dictation.id,
        toastMessage: toastMessage,
      }});
  }

  pushOpenDictation(dictation: Dictation) {
    this.router.navigate(['/dictation-view'], {
      queryParams: {
        dictation: dictation,
        dictationId: dictation.id
      }});
  }

  editDictation(dictation: Dictation) {
    this.router.navigate(['/edit-dictation'], {
      queryParams: {
        dictation: dictation
      }});
  }

  openAccountPage() {
    this.router.navigate(['/account-page']);
  }
}
