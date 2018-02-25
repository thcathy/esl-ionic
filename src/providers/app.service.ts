import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

@Injectable()
export class AppService {

  constructor(public platform: Platform
  ) { }

  isApp(): boolean {
    console.log(`platforms: ${this.platform._platforms}`);
    if(this.platform.is('core') || this.platform.is('mobileweb') || document.URL.startsWith('http')) {
      return false;
    } else {
      return true;
    }
  }

}
