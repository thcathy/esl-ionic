import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TranslateService} from '@ngx-translate/core';
import {defaultImage} from '../../entity/dictation';
import {DictationUtils} from '../../utils/dictation-utils';
import {IonicComponentService} from '../../services/ionic-component.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';

@Component({
    selector: 'vocab-image',
    templateUrl: 'vocab-image.html',
    styleUrls: ['vocab-image.scss'],
    animations: [
        trigger('move', [
            state('center', style({ transform: 'translateX(0%)' })),
            state('left', style({ transform: 'translateX(-200%)' })),
            state('right', style({ transform: 'translateX(200%)' })),
            state('left-end', style({ transform: 'translateX(-200%)' })),
            state('right-end', style({ transform: 'translateX(200%)' })),
            transition('center <=> *', [
                animate(200)
            ])
        ])
    ],
    standalone: false
})
export class VocabImageComponent implements OnChanges, OnDestroy {
  @Input() images: string[];
  @Input() phrase = '';
  @Input() canReport = false;
  index: number;
  state = 'center';
  imageBase64 = '';
  showingPlaceholder = false;
  private reported = false;
  private reporting = false;
  private alive = true;
  private imageLoad = 0;

  constructor(
    private readonly vocabPracticeService: VocabPracticeService,
    private readonly ionic: IonicComponentService,
    private readonly translate: TranslateService,
  ) {
    this.index = 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['images']) {
      return;
    }
    this.reported = false;
    this.reporting = false;
    this.imageLoad++;
    if (DictationUtils.notValidImages(this.images)) {
      this.images = defaultImage;
      this.showingPlaceholder = true;
    } else {
      this.showingPlaceholder = false;
    }
    this.index = Math.floor(Math.random() * this.images.length);
    this.imageBase64 = this.images[this.index];
  }

  ngOnDestroy() {
    this.alive = false;
  }

  get canCycle(): boolean {
    return (this.images?.length ?? 0) > 1;
  }

  get reportEnabled(): boolean {
    return this.canReport
      && !this.showingPlaceholder
      && !this.reported
      && !this.reporting
      && this.phrase.trim().length > 0
      && this.index >= 0;
  }

  nextImage() {
    this.state = 'right';
    this.index++;
    if (this.index >= this.images.length) { this.index = 0; }
  }

  previousImage() {
    this.state = 'left';
    this.index--;
    if (this.index < 0) {
      this.index = this.images.length - 1;
    }
  }

  onDone(_event) {
    this.imageBase64 = this.images[this.index];
    if (this.state === 'left') {
      this.state = 'right-end';
    } else if (this.state === 'right') {
      this.state = 'left-end';
    } else if (this.state.endsWith('-end')) {
      this.state = 'center';
    }
  }

  flagImage() {
    if (!this.reportEnabled) {
      return;
    }

    const phrase = this.phrase.trim();
    const imageIndex = this.index;
    const load = this.imageLoad;
    this.reporting = true;
    this.vocabPracticeService.flagImage({phrase, imageIndex}).subscribe({
      next: () => {
        if (!this.alive || load !== this.imageLoad) {
          return;
        }
        this.reporting = false;
        this.reported = true;
        void this.ionic.showToastMessage(this.translate.instant('VocabImage.ReportThanks'));
      },
      error: () => {
        if (!this.alive || load !== this.imageLoad) {
          return;
        }
        this.reporting = false;
      },
    });
  }

}
