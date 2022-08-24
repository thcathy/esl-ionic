import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Dictation } from '../entity/dictation';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor() { 
  }

  async shareDictation(dictation: Dictation) {
    await Share.share({
      title: 'FunFunSpell Dictation',
      text: `Share dictation: ${dictation.title}`,
      url: `https://www.funfunspell.com/link/dictation-view/${dictation.id}`,
      dialogTitle: 'Share Dictation',
    });
  
  }
  
}
