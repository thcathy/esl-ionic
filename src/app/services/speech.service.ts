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

  speak(text: string, rate = 0.7) {
    rate = Math.round(rate * 10) / 10;
    this.log.info(`speak ${text} in speed ${rate}`);

    if (this.appService.isApp()) {
      if (this.appService.isIOS()) { rate = rate * 2; }

      TextToSpeech.speak({
        text: text,
        lang: 'en-US',
        rate: rate,
      })
      .then(() => this.log.debug(`Speak by tts: ${text}`))
      .catch((reason: any) => this.log.warn(reason));

    } else {
      this.synth = window.speechSynthesis;
      const utterance1 = new SpeechSynthesisUtterance(text);
      utterance1.rate = rate;
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
