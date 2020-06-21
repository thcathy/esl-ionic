import { Injectable } from '@angular/core';
import {Storage} from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class UIOptionsService {
  public static keys = {
    disableKeyboard: 'UIOptionsService.keys.disableKeyboard',
  };

  constructor(
    private storage: Storage,
  ) { }

  loadOption(key: string): Promise<any> {
    return this.storage.get(key);
  }

  saveOption(key: string, value: any): Promise<any> {
    return this.storage.set(key, value);
  }
}

