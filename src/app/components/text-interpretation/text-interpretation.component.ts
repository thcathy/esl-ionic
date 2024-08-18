import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {InterpretationService} from "../../services/practice/interpretation.service";

@Component({
  selector: 'app-text-interpretation',
  template: `
    <ion-item>
      <span style="margin-right: 8px;"><ion-toggle [(ngModel)]="enabled" /></span>{{ 'AI translate'|translate }}:&nbsp;<span>{{ enabled ? translatedText : '-' }}</span>
      <span *ngIf="translatedText === ''">
        <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
      </span>
    </ion-item>
  `,
  styleUrls: ['./text-interpretation.component.scss'],
})
export class TextInterpretationComponent  implements OnInit, OnChanges {
  @Input() text: string = '';
  translatedText: string = '';
  enabled: boolean = true;

  constructor(private interpretationService: InterpretationService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.text) {
      this.translateText();
    }
  }

  translateText() {
    this.interpretationService.interpret(this.text).subscribe(
      (result: string) => this.translatedText = result
    );
  }
}
