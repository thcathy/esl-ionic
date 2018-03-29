import {Injectable} from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {App} from "ionic-angular";
import {Dictation} from "../entity/dictation";

@Injectable()
export class NavigationService {

  constructor(public app: App) {
  }

  startDictation(dictation: Dictation) {
    let navCtrl = this.app.getActiveNavs()[0];
    console.log(`${navCtrl.id}`);
    navCtrl.setRoot('DictationPracticePage', {
      'dictation': dictation,
      'dictationId': dictation.id,
    });
  }

  openDictation(dictation: Dictation, toastMessage: string = null) {
    let navCtrl = this.app.getActiveNavs()[0];
    console.log(`${navCtrl.id}`);
    navCtrl.setRoot('DictationViewPage', {
      dictation: dictation,
      dictationId: dictation.id,
      toastMessage: toastMessage,
    });
  }

  editDictation(dictation: Dictation) {
    let navCtrl = this.app.getActiveNavs()[0];
    navCtrl.setRoot('EditDictationPage', {
      dictation: dictation
    });
  }
}
