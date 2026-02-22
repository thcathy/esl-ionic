import {Component, Input} from '@angular/core';
import {SentenceHistory} from "../../entity/sentence-history";
import {SpeechService} from "../../services/speech.service";

@Component({
    selector: 'sentence-histories',
    templateUrl: 'sentence-histories.html',
    styleUrls: ['sentence-histories.scss'],
    standalone: false
})
export class SentenceHistoriesComponent {
  @Input() histories: SentenceHistory[];
  @Input() speakPunctuation = false;

  constructor(public speechService: SpeechService) {
  }

  speak(text: string) {
    void this.speechService.speakByVoiceMode(text, { speakPunctuation: this.speakPunctuation });
  }

}
