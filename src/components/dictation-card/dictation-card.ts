import {Component, Input} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {NavController} from "ionic-angular";
import {NavigationService} from "../../providers/navigation.service";

@Component({
  selector: 'dictation-card',
  templateUrl: 'dictation-card.html'
})
export class DictationCardComponent {
  @Input() dictation: Dictation;
  @Input() start: boolean = false;
  @Input() retry: boolean = false;

  constructor(public navCtrl: NavController,
              public navService: NavigationService)
  {}

  suitableAge(dictation: Dictation) {
    if (dictation.suitableMaxAge < 1 || dictation.suitableMinAge < 1)
      return "SuitableAge.Any";
    else
      return dictation.suitableMinAge + " - " + dictation.suitableMaxAge;
  }


}
