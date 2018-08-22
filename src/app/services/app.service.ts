import { Injectable } from '@angular/core';
import {Platform} from "@ionic/angular";

@Injectable({ providedIn: 'root' })
export class AppService {

  constructor(public platform: Platform
  ) { }

  isApp(): boolean {
    console.log(`platforms: ${this.platform.platforms()}, url: ${document.URL}`);
    if(this.platform.is('core') || this.platform.is('mobileweb')) {
      return false;
    } else {
      return true;
    }
  }

  isIOS(): boolean {
    return this.platform.is('ios');
  }
}
