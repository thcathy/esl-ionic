import {Component, Input} from '@angular/core';
import {SentenceHistory} from "../../entity/sentence-history";
import {SpeechService} from "../../services/speech.service";

@Component({
  selector: 'sentence-histories',
  templateUrl: 'sentence-histories.html',
  styleUrls: ['sentence-histories.scss'],
})
export class SentenceHistoriesComponent {
  @Input() histories: SentenceHistory[];

  constructor(public speechService: SpeechService) {
  }

}
