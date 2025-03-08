import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {InterpretationService} from "../../services/practice/interpretation.service";

@Component({
  selector: 'app-text-interpretation',
  template: `
    <ion-item style="display: flex; align-items: flex-start; margin-top: 8px;">
      <span style="margin-right: 8px;">
        <ion-toggle [(ngModel)]="enabled" />
      </span>
      <span>
        <span *ngIf="!interpretationService.isEN()">{{ 'AI translate'|translate }}</span>
        <span *ngIf="interpretationService.isEN()">Meaning by AI</span>:&nbsp;<span>{{ enabled ? translatedText : '-' }}
        </span>
        <span *ngIf="translatedText === ''">
          <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
        </span>
      </span>
    </ion-item>
  `,
  styleUrls: ['./text-interpretation.component.scss'],
})
export class TextInterpretationComponent  implements OnInit, OnChanges {
  @Input() text: string = '';
  translatedText: string = '';
  enabled: boolean = true;

  constructor(protected interpretationService: InterpretationService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.text) {
      this.translatedText = '';
      this.translateText();
    }
  }

  translateText() {
    this.interpretationService.interpret(this.text).subscribe(
      (result: string) => this.translatedText = result
    );
  }
}
