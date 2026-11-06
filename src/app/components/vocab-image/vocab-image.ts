import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TranslateService} from '@ngx-translate/core';
import {defaultImage} from '../../entity/dictation';
import {CollectionUtils} from '../../utils/collection-utils';
import {DictationUtils} from '../../utils/dictation-utils';
import {ImageReportService} from '../../services/image-report.service';
import {IonicComponentService} from '../../services/ionic-component.service';

interface PracticeImage {
  src: string;
  sourceIndex: number;
}

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
  @Input() practiceSession = 0;
  index: number;
  state = 'center';
  imageBase64 = '';
  showingPlaceholder = false;
  private displayImages: PracticeImage[] = [];
  private reported = false;
  private reporting = false;
  private alive = true;

  constructor(
    private readonly imageReportService: ImageReportService,
    private readonly ionic: IonicComponentService,
    private readonly translate: TranslateService,
  ) {
    this.index = 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['practiceSession']) {
      this.reported = false;
      this.reporting = false;
    }
    if (changes['images'] || changes['practiceSession']) {
      this.refreshImages();
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }

  get canCycle(): boolean {
    return this.displayImages.length > 1;
  }

  get currentSourceIndex(): number {
    return this.displayImages[this.index]?.sourceIndex ?? -1;
  }

  get reportEnabled(): boolean {
    return this.canReport
      && !this.showingPlaceholder
      && !this.reported
      && !this.reporting
      && this.phrase.trim().length > 0
      && this.currentSourceIndex >= 0;
  }

  nextImage() {
    this.state = 'right';
    this.index++;
    if (this.index >= this.displayImages.length) { this.index = 0; }
  }

  previousImage() {
    this.state = 'left';
    this.index--;
    if (this.index < 0) {
      this.index = this.displayImages.length - 1;
    }
  }

  onDone(_event) {
    this.imageBase64 = this.displayImages[this.index].src;
    if (this.state === 'left') {
      this.state = 'right-end';
    } else if (this.state === 'right') {
      this.state = 'left-end';
    } else if (this.state.endsWith('-end')) {
      this.state = 'center';
    }
  }

  reportImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.reportEnabled) {
      return;
    }

    const phrase = this.phrase.trim();
    const imageIndex = this.currentSourceIndex;
    const session = this.practiceSession;
    this.reporting = true;
    this.imageReportService.report({phrase, imageIndex}).subscribe({
      next: () => {
        if (!this.alive || session !== this.practiceSession) {
          return;
        }
        this.reporting = false;
        this.reported = true;
        void this.ionic.showToastMessage(this.translate.instant('VocabImage.ReportThanks'));
      },
      error: () => {
        if (!this.alive || session !== this.practiceSession) {
          return;
        }
        this.reporting = false;
      },
    });
  }

  private refreshImages() {
    const incoming = this.images;
    if (DictationUtils.notValidImages(incoming)) {
      this.displayImages = defaultImage.map((src, sourceIndex) => ({src, sourceIndex}));
      this.showingPlaceholder = true;
    } else {
      this.displayImages = CollectionUtils.shuffle(
        incoming.map((src, sourceIndex) => ({src, sourceIndex}))
      );
      this.showingPlaceholder = false;
    }
    this.index = 0;
    this.imageBase64 = this.displayImages[0].src;
  }
}
