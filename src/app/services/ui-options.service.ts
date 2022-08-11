import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UIOptionsService {
  public static keys = {
    disableKeyboard: 'UIOptionsService.keys.disableKeyboard',
    keyboardType: 'UIOptionsService.keys.keyboardType',
    vocabPracticeType: 'UIOptionsService.keys.vocabPracticeType',
    puzzleSize: 'UIOptionsService.keys.puzzleSize',
  };

  constructor(
    private storage: StorageService,
  ) { }

  loadOption(key: string): Promise<any> {
    return this.storage.get(key);
  }

  saveOption(key: string, value: any): Promise<any> {
    return this.storage.set(key, value);
  }
}

