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
    let navCtrl = this.app.getActiveNav();
    navCtrl.setRoot('DictationPracticePage', {
      'dictation': dictation,
      'dictationId': dictation.id,
    });
  }
}
