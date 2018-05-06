import {Component, Input} from '@angular/core';
import {SentenceHistory} from "../../entity/sentence-history";

@Component({
  selector: 'sentence-histories',
  templateUrl: 'sentence-histories.html'
})
export class SentenceHistoriesComponent {
  @Input() histories: SentenceHistory[];

  constructor() {
  }

}
