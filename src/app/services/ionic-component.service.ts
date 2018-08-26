import {Injectable} from '@angular/core';

import {TranslateService} from "@ngx-translate/core";
import {LoadingController} from "@ionic/angular";

@Injectable({ providedIn: 'root' })
export class IonicComponentService {

  constructor(public loadingController: LoadingController,
              public translate: TranslateService
  ) { }

  async showLoading() {
    const loading = await this.loadingController.create({
      content: 'Please wait...',
      duration: 3000
    });
    loading.present();
    return loading;
  }
}
