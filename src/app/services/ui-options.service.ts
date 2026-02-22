import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UIOptionsService {
  public static voiceMode = {
    local: 'local',
    online: 'online',
  };

  public static keys = {
    disableKeyboard: 'UIOptionsService.keys.disableKeyboard',
    keyboardType: 'UIOptionsService.keys.keyboardType',
    vocabPracticeType: 'UIOptionsService.keys.vocabPracticeType',
    puzzleSize: 'UIOptionsService.keys.puzzleSize',
    ttsVoiceMode: 'UIOptionsService.keys.ttsVoiceMode',
    editDictationType: 'UIOptionsService.keys.editDictationType',
    editDictationSentenceLength: 'UIOptionsService.keys.editDictationSentenceLength',
    editDictationShowImage: 'UIOptionsService.keys.editDictationShowImage',
    editDictationIncludeAIImage: 'UIOptionsService.keys.editDictationIncludeAIImage',
    editDictationWordContainSpace: 'UIOptionsService.keys.editDictationWordContainSpace',
    editDictationWordPracticeType: 'UIOptionsService.keys.editDictationWordPracticeType',
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

