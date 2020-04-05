import {Injectable} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';
import {Observable, Subject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IonicComponentService {

  constructor(public loadingController: LoadingController,
              public translate: TranslateService,
              public toastController: ToastController,
              public alertController: AlertController,
  ) { }

  async showLoading() {
    const loading = await this.loadingController.create({
      message: this.translate.instant('Please wait') + '...',
      duration: 5000
    });
    loading.present();
    return loading;
  }

  async showAlert(message: string, header: string = null) {
    const alert = await this.alertController.create({
      header: header,
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

  confirmExit(): Observable<boolean> {
    const confirmExit$ = new Subject<boolean>();

    this.alertController.create({
      header: `${this.translate.instant('Confirm')}!`,
      message: `${this.translate.instant('Exit without saving')}?`,
      buttons: [
        {
          text: this.translate.instant('Back'),
          handler: () => confirmExit$.next(false)
        },
        {
          text: this.translate.instant('Leave'),
          cssClass: 'leave-button',
          handler: () => confirmExit$.next(true)
        },
      ]
    }).then(alert => alert.present());
    return confirmExit$;
  }
}
