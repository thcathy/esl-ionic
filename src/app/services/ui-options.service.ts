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
    // v2: reset prior false defaults so Create/Quick opt into images/AI images once.
    editDictationShowImage: 'UIOptionsService.keys.editDictationShowImage.v2',
    editDictationIncludeAIImage: 'UIOptionsService.keys.editDictationIncludeAIImage.v2',
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

