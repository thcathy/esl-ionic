import {Injectable} from '@angular/core';

import {Storage} from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Promise<Storage> | null = null;  

  constructor(private storage: Storage) {
    this.init();
  }

  init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    this._storage = this.storage.create();    
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public set(key: string, value: any) {
    return this._storage?.then(s => s.set(key, value));    
  }

  public get(key: string) {
    return this._storage?.then(s => s.get(key));
  }
}
