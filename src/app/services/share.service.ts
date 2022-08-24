import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Dictation } from '../entity/dictation';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor() { 
  }

  public async shareDictation(dictation: Dictation) {
    return await Share.share({
      title: `Share FunFunSpell Dictation - ${dictation.title}`,
      url: `https://www.funfunspell.com/link/dictation-view/${dictation.id}`,
      // do not set following such that safari allow more share option
      // text: `Share dictation: ${dictation.title}`,
      // dialogTitle: 'Share Dictation',
    });
  }
  
}
