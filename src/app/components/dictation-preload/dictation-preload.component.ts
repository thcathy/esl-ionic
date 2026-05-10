import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';

export enum PreloadCategoryName {
  Questions = 'questions',
  Voices = 'voices',
  Images = 'images',
  Interpretations = 'interpretations',
}

export interface PreloadCategory {
  total: number;
  loaded: number;
  failed: number;
  state: 'idle' | 'loading' | 'done' | 'failed';
}

export interface PreloadResult {
  useLocalVoice: boolean;
}

export interface PreloadTotals {
  [PreloadCategoryName.Questions]: number;
  [PreloadCategoryName.Voices]: number;
  [PreloadCategoryName.Images]: number;
  [PreloadCategoryName.Interpretations]: number;
}

@Component({
  selector: 'app-dictation-preload',
  templateUrl: './dictation-preload.component.html',
  styleUrls: ['./dictation-preload.component.scss'],
  standalone: false
})
export class DictationPreloadComponent implements OnDestroy {
  private static readonly GLOBAL_TIMEOUT_MS = 15000;
  private static readonly MIN_DISPLAY_MS = 2000;
  private static readonly LOOP_INTERVAL_MS = 500;

  private startTime = 0;
  resetting = false;

  questions: PreloadCategory = { total: 0, loaded: 0, failed: 0, state: 'idle' };
  voices: PreloadCategory = { total: 0, loaded: 0, failed: 0, state: 'idle' };
  images: PreloadCategory = { total: 0, loaded: 0, failed: 0, state: 'idle' };
  interpretations: PreloadCategory = { total: 0, loaded: 0, failed: 0, state: 'idle' };

  statusMessage = 'Preload.Status.Preparing';
  currentTipIndex = 0;
  showContinueButton = false;

  @Output() preloadCompleted = new EventEmitter<PreloadResult>();

  countdown = 0;

  private loopInterval: ReturnType<typeof setInterval> | null = null;
  private tipInterval: ReturnType<typeof setInterval> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  readonly tips: string[] = [
    'Preload.Tip.VoiceMode',
    'Preload.Tip.Speed',
    'Preload.Tip.SpeakPunctuation',
    'Preload.Tip.PuzzleMode',
    'Preload.Tip.CreateDictation',
    'Preload.Tip.OfflineMode',
  ];

  readonly lettersRow1 = [
    { char: 'F', color: '#2DBDEF' },
    { char: 'U', color: '#F08A1E' },
    { char: 'N', color: '#4CAF50' },
    { char: 'F', color: '#A7C713' },
    { char: 'U', color: '#2FB62F' },
    { char: 'N', color: '#2DBDEF' },
  ];

  readonly lettersRow2 = [
    { char: 'S', color: '#4CAF50' },
    { char: 'P', color: '#F08A1E' },
    { char: 'E', color: '#2DBDEF' },
    { char: 'L', color: '#A7C713' },
    { char: 'L', color: '#2FB62F' },
  ];

  /** Starts the preload process. Categories with total 0 are auto-completed (nothing to load). */
  start(totals: PreloadTotals): void {
    this.stopLoop();
    this.stopCountdown();
    if (this.tipInterval) { clearInterval(this.tipInterval); this.tipInterval = null; }

    this.resetting = true;
    this.questions       = { total: totals.questions,       loaded: 0, failed: 0, state: 'idle' };
    this.voices          = { total: totals.voices,          loaded: 0, failed: 0, state: 'idle' };
    this.images          = { total: totals.images,          loaded: 0, failed: 0, state: 'idle' };
    this.interpretations = { total: totals.interpretations, loaded: 0, failed: 0, state: 'idle' };
    this.statusMessage = 'Preload.Status.Preparing';
    this.showContinueButton = false;
    this.currentTipIndex = 0;
    this.startTime = Date.now();
    requestAnimationFrame(() => { this.resetting = false; });

    Object.values(PreloadCategoryName).forEach(name => {
      if (this[name].total === 0) { this[name].state = 'done'; }
    });
    this.startTipRotation();
    this.loopInterval = setInterval(() => this.checkCompletion(), DictationPreloadComponent.LOOP_INTERVAL_MS);
  }

  /** Mark a whole category as instantly complete (e.g. local voice mode, content from cache). */
  completeCategory(name: PreloadCategoryName): void {
    const cat = this[name];
    cat.loaded = cat.total;
    cat.failed = 0;
    cat.state = 'done';
  }

  recordQuestion(success: boolean): void { this.recordResult(this.questions, success); }
  recordVoice(success: boolean): void { this.recordResult(this.voices, success); }
  recordImage(success: boolean): void { this.recordResult(this.images, success); }
  recordInterpretation(success: boolean): void { this.recordResult(this.interpretations, success); }

  onContinueWithLocalVoice(): void {
    this.stopCountdown();
    this.stopLoop();
    this.preloadCompleted.emit({ useLocalVoice: true });
  }

  getProgress(cat: PreloadCategory): number {
    if (cat.total === 0) { return 1; }
    return (cat.loaded + cat.failed) / cat.total;
  }

  getPercent(cat: PreloadCategory): number {
    return Math.round(this.getProgress(cat) * 100);
  }

  ngOnDestroy(): void {
    this.stopLoop();
    this.stopCountdown();
    if (this.tipInterval) { clearInterval(this.tipInterval); }
  }

  private recordResult(cat: PreloadCategory, success: boolean): void {
    if (cat.state === 'idle') { cat.state = 'loading'; }
    if (success) { cat.loaded++; } else { cat.failed++; }
    if (cat.loaded + cat.failed >= cat.total) {
      cat.state = cat.failed > 0 ? 'failed' : 'done';
    }
  }

  private checkCompletion(): void {
    const elapsed = Date.now() - this.startTime;

    if (elapsed >= DictationPreloadComponent.GLOBAL_TIMEOUT_MS) {
      this.finalize();
    }

    if (!this.allCategoriesFinished()) { return; }

    if (this.voices.state === 'failed') {
      this.statusMessage = 'Preload.Status.VoiceFailed';
      this.showContinueButton = true;
      this.stopLoop();
      this.startCountdown();
      return;
    }

    if (elapsed >= DictationPreloadComponent.MIN_DISPLAY_MS) {
      this.statusMessage = 'Preload.Status.AllReady';
      this.stopLoop();
      this.preloadCompleted.emit({ useLocalVoice: false });
    }
  }

  private finalize(): void {
    Object.values(PreloadCategoryName).forEach(name => {
      const cat = this[name];
      if (cat.state === 'done' || cat.state === 'failed') { return; }
      cat.state = cat.failed > 0 || cat.loaded + cat.failed < cat.total ? 'failed' : 'done';
    });
  }

  private allCategoriesFinished(): boolean {
    return Object.values(PreloadCategoryName)
      .every(name => this[name].state === 'done' || this[name].state === 'failed');
  }

  private startCountdown(): void {
    this.countdown = 10;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopCountdown();
        this.onContinueWithLocalVoice();
      }
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownInterval) { clearInterval(this.countdownInterval); this.countdownInterval = null; }
  }

  private stopLoop(): void {
    if (this.loopInterval) { clearInterval(this.loopInterval); this.loopInterval = null; }
  }

  private startTipRotation(): void {
    this.tipInterval = setInterval(() => {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
    }, 4000);
  }
}
