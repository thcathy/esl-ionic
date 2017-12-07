import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

@Injectable()
export class AppService {

  constructor(public platform: Platform
  ) { }

  isApp(): boolean {
    return this.platform.is('ios') || this.platform.is('android');
  }

}
