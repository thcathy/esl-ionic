import {Component, Input} from '@angular/core';
import {Dictation} from "../../entity/dictation";
import {NavController} from "ionic-angular";
import {NavigationService} from "../../providers/navigation.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {DictationService} from "../../providers/dictation/dictation.service";

@Component({
  selector: 'dictation-card',
  templateUrl: 'dictation-card.html',
  animations: [
    trigger('recommend', [
      state('highlight', style({backgroundColor: 'transparent'})),
      transition('normal => highlight', [
        animate('1s ease-out',
          style({
            backgroundColor: '#4ab948',
            color: '#ffffff'
          })
        ),
        animate('1s ease-in', style({backgroundColor: '#ffffff'}))
      ])
    ])
  ]
})
export class DictationCardComponent {
  @Input() dictation: Dictation;
  @Input() start: boolean = false;
  @Input() retry: boolean = false;
  @Input() edit: boolean = false;
  @Input() showContent: boolean = true;
  recommendState: string = 'normal';

  constructor(public navCtrl: NavController,
              public navService: NavigationService,
              public dictationService: DictationService,
              )
  {}

  highlightRecommend() {
    this.recommendState = 'highlight';
  }

  recommendAnimationDone() : void {
    this.recommendState = 'normal';
  }

}
