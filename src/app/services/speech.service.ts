import {Injectable} from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {AppService} from "./app.service";
import {TextToSpeech} from "@ionic-native/text-to-speech";

declare var responsiveVoice: any;
declare var textToSpeech: TextToSpeech;

@Injectable({ providedIn: 'root' })
export class SpeechService {

  constructor(
    public appService: AppService,
  ) {}

  speak(text: string, rate = 0.7) {
    rate = Math.round(rate * 10) / 10;
    console.log(`speak ${text} in speed ${rate}`);
    if (this.appService.isApp()) {
      if (this.appService.isIOS()) rate = rate * 2;
      textToSpeech.speak({
          text: text,
          locale: 'en-US',
          rate: rate
      })
        .then(() => console.log(`Speak by tts: ${text}`))
        .catch((reason: any) => console.log(reason));
    } else {
      console.log(`speak by responsive voice: ${text}`);
      responsiveVoice.cancel();
      responsiveVoice.speak(text, "UK English Female", {rate: rate});
    }
  }

  stop() {
    if (this.appService.isApp()) {
      textToSpeech.stop().then(() => console.log(`stopped tss`));
    } else {
      responsiveVoice.cancel();
    }
  }
}
