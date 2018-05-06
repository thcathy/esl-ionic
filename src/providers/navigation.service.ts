import {Injectable} from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {App} from "ionic-angular";
import {Dictation} from "../entity/dictation";

@Injectable()
export class NavigationService {

  constructor(public app: App) {
  }

  private getNavigationController() {
    let navCtrl = this.app.getActiveNavs()[0];
    console.log(`${navCtrl.id}`);
    return navCtrl;
  }

  startDictation(dictation: Dictation) {
    this.getNavigationController().setRoot('DictationPracticePage', {
      'dictation': dictation,
      'dictationId': dictation.id,
    });
  }

  startArticleDictation(dictation: Dictation) {
    this.getNavigationController().setRoot('ArticleDictationPage', {
      'dictation': dictation
    });
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
