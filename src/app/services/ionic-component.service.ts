import {Injectable} from '@angular/core';

import {TranslateService} from "@ngx-translate/core";
import {AlertController, LoadingController, ToastController} from "@ionic/angular";

@Injectable({ providedIn: 'root' })
export class IonicComponentService {

  constructor(public loadingController: LoadingController,
              public translate: TranslateService,
              public toastController: ToastController,
              public alertController: AlertController,
  ) { }

  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      duration: 3000
    });
    loading.present();
    return loading;
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      message: message,
      buttons: [this.translate.instant('OK')]
    });
    alert.present();
    return alert;
  }

  async showToastMessage(message: string, position: 'top' | 'bottom' | 'middle' = 'top') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: position
    });
    toast.present();
  }
}
