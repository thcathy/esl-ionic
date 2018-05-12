import {Injectable} from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {App} from "ionic-angular";
import {Dictation} from "../entity/dictation";
import {DictationService} from "./dictation/dictation.service";

@Injectable()
export class NavigationService {

  constructor(public app: App,
              public dictationService: DictationService)
  {}

  private getNavigationController() {
    let navCtrl = this.app.getActiveNavs()[0];
    console.log(`${navCtrl.id}`);
    return navCtrl;
  }

  startDictation(dictation: Dictation) {
    if (this.dictationService.isSentenceDictation(dictation)) {
      this.getNavigationController().setRoot('ArticleDictationPage', {
        'dictation': dictation
      });
    } else {
      this.getNavigationController().setRoot('DictationPracticePage', {
        'dictation': dictation,
        'dictationId': dictation.id,
      });
    }
  }

  retryDictation(dictation: Dictation) {
    if (this.dictationService.isInstantDictation(dictation))
      this.getNavigationController().setRoot('InstantDictationPage');
    else
      this.startDictation(dictation);
  }


  openDictation(dictation: Dictation, toastMessage: string = null) {
    this.getNavigationController().setRoot('DictationViewPage', {
      dictation: dictation,
      dictationId: dictation.id,
      toastMessage: toastMessage,
    });
  }

  editDictation(dictation: Dictation) {
    this.getNavigationController().setRoot('EditDictationPage', {
      dictation: dictation
    });
  }
}
