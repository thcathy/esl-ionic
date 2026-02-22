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
        <span>{{ 'AI translate'|translate }}: </span>
        <span id="meaning">{{ enabled ? translatedText : '-' }}</span>
        @if (enabled && translatedText === '') {
          <span>
            <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
          </span>
        }
      </span>
    </ion-item>
    `,
    styleUrls: ['./text-interpretation.component.scss'],
    standalone: false
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
