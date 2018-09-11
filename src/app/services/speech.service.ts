import {Injectable} from '@angular/core';

import {AppService} from "./app.service";
import {TextToSpeech} from "@ionic-native/text-to-speech/ngx";

@Injectable({ providedIn: 'root' })
export class SpeechService {
  synth: any;

  constructor(
    public appService: AppService,
    public textToSpeech: TextToSpeech,
  ) {}

  speak(text: string, rate = 0.7) {
    rate = Math.round(rate * 10) / 10;
    console.log(`speak ${text} in speed ${rate}`);
    if (this.appService.isApp()) {
      if (this.appService.isIOS()) rate = rate * 2;
      this.textToSpeech.speak({
          text: text,
          locale: 'en-US',
          rate: rate
      })
        .then(() => console.log(`Speak by tts: ${text}`))
        .catch((reason: any) => console.log(reason));
    } else {
      this.synth = window.speechSynthesis;
      var utterance1 = new SpeechSynthesisUtterance(text);
      utterance1.rate = rate;
      this.synth.speak(utterance1);
      console.log(`speak by web api: ${text}`);
    }
  }

  stop() {
    if (this.appService.isApp()) {
      this.textToSpeech.stop().then(() => console.log(`stopped tss`));
    } else {
      this.synth.stop();
    }
  }
}
