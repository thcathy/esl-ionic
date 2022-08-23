import { Injectable } from '@angular/core';
import {Platform} from '@ionic/angular';
import {NGXLogger} from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class AppService {

  constructor(
    public platform: Platform,
    private log: NGXLogger,
  ) { }

  isApp(): boolean {
    this.log.debug(`platforms: ${this.platform.platforms()}, url: ${document.URL}`);
    if (this.platform.is('pwa') || !this.platform.is('cordova') || !this.platform.is('capacitor')) {
      return false;
    } else {
      return true;
    }
  }

  isCapacitor(): boolean {
    return this.platform.is('capacitor');
  }

  isCordova(): boolean {
    return this.platform.is('cordova');
  }

  isIOS(): boolean {
    return this.platform.is('ios');
  }
}
