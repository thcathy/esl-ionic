import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

@Injectable()
export class AppService {

  constructor(public platform: Platform
  ) { }

  isApp(): boolean {
    console.log(`platforms: ${this.platform._platforms}, url: ${document.URL}`);
    if(this.platform.is('core') || this.platform.is('mobileweb')) {
      return false;
    } else {
      return true;
    }
  }

  openFunFunSpell() {
    window.open('https://www.funfunspell.com/', '_system');
  }

}
