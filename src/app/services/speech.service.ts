import {Injectable} from '@angular/core';

import {AppService} from './app.service';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import {NGXLogger} from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  synth: any;

  constructor(
    public appService: AppService,
    private log: NGXLogger,
  ) {}

  async speak(text: string, rate = 0.7) {
    rate = Math.round(rate * 10) / 10;
    console.info(`speak ${text} in speed ${rate}`);


    if (!this.appService.isIOS() && this.appService.isApp()) {
      const langs = await TextToSpeech.getSupportedLanguages();
      const lang = langs.languages.find((l) => l.startsWith('en-'));
      console.log(`lang=${lang}, langs=${JSON.stringify(langs)}`);

      if (this.appService.isIOS()) {
        rate = rate * 2;
      }

      await TextToSpeech.stop();
      await TextToSpeech.speak({
        text: text,
        lang: lang,
        rate: rate,
      })
        .then(() => this.log.debug(`Speak by tts: ${text}`))
        .catch((reason: any) => this.log.warn(JSON.stringify(reason)));
    } else {
      this.synth = window.speechSynthesis;
      var langs = this.synth.getVoices().flatMap(v => v.lang);
      const lang = langs.find(l => l.startsWith("en-"));
      console.log(`lang=${lang}, langs=${JSON.stringify(langs)}`);

      const utterance1 = new SpeechSynthesisUtterance(text);
      utterance1.rate = rate;
      utterance1.lang = lang;
      this.synth.cancel();
      this.synth.speak(utterance1);
      this.log.info(`speak by web api: ${text}`);
    }
  }

  stop() {
    if (this.appService.isApp()) {
      TextToSpeech.stop().then(() => this.log.info(`stopped tss`));
    } else {
      this.synth.stop();
    }
  }
}
