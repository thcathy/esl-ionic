import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {NGXLogger} from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class AppService {

  constructor(
    public platform: Platform,
    private log: NGXLogger,
  ) { }

  isApp(): boolean {
    // this.log.info(`platforms: ${this.platform.platforms()}, url: ${document.URL}`);
    let isAppPlatform = this.platform.is('cordova') || this.platform.is('capacitor');
    let isPWA = this.platform.is('pwa');
    return isAppPlatform && !isPWA;
  }

  isCapacitor(): boolean {
    return this.platform.is('capacitor') || this.platform.is('cordova');
  }

  isIOS(): boolean {
    return this.platform.is('ios');
  }
}
