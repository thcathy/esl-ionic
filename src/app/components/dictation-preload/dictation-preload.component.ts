import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

export interface PreloadCategory {
  total: number;
  loaded: number;
  failed: number;
  state: 'idle' | 'loading' | 'done' | 'failed';
}

@Component({
  selector: 'app-dictation-preload',
  templateUrl: './dictation-preload.component.html',
  styleUrls: ['./dictation-preload.component.scss'],
  standalone: false
})
export class DictationPreloadComponent implements OnDestroy {
  private static readonly GLOBAL_TIMEOUT_MS = 15000;
  private static readonly AUTO_TRANSITION_DELAY_MS = 800;
  private static readonly MIN_DISPLAY_MS = 1800;

  private startTime = Date.now();

  dictionary: PreloadCategory = { total: 0, loaded: 0, failed: 0, state: 'idle' };
  voices: PreloadCategory = { total: 0, loaded: 0, failed: 0, state: 'idle' };
  images: PreloadCategory = { total: 0, loaded: 0, failed: 0, state: 'idle' };

  statusMessage = '';
  currentTipIndex = 0;
  showContinueButton = false;

  @Output() preloadDone = new EventEmitter<boolean>();
  @Output() continueWithLocalVoice = new EventEmitter<void>();

  private globalTimeout: ReturnType<typeof setTimeout> | null = null;
  private tipInterval: ReturnType<typeof setInterval> | null = null;
  private dictionaryComplete = false;
  private voicesComplete = false;
  private imagesComplete = false;

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

  constructor(private translate: TranslateService) {
    this.statusMessage = 'Preload.Status.Preparing';
    this.startTipRotation();
  }

  trackDictionary(promise: Promise<boolean>): void {
    this.startCategoryLoading(this.dictionary);
    this.dictionary.total++;
    promise.then(success => {
      if (success) { this.dictionary.loaded++; } else { this.dictionary.failed++; }
      this.checkCategoryCompletion(this.dictionary, this.dictionaryComplete);
    });
  }

  trackVoice(promise: Promise<boolean>): void {
    this.startCategoryLoading(this.voices);
    this.voices.total++;
    promise.then(success => {
      if (success) { this.voices.loaded++; } else { this.voices.failed++; }
      this.checkCategoryCompletion(this.voices, this.voicesComplete);
    });
  }

  trackImage(promise: Promise<boolean>): void {
    this.startCategoryLoading(this.images);
    this.images.total++;
    promise.then(success => {
      if (success) { this.images.loaded++; } else { this.images.failed++; }
      this.checkCategoryCompletion(this.images, this.imagesComplete);
    });
  }

  markDictionaryComplete(): void {
    this.dictionaryComplete = true;
    if (this.dictionary.state === 'idle') {
      this.dictionary.state = 'done';
    }
    this.checkCategoryCompletion(this.dictionary, true);
  }

  markVoicesComplete(): void {
    this.voicesComplete = true;
    if (this.voices.state === 'idle') {
      this.voices.state = 'done';
    }
    this.checkCategoryCompletion(this.voices, true);
  }

  markImagesComplete(): void {
    this.imagesComplete = true;
    if (this.images.state === 'idle') {
      this.images.state = 'done';
    }
    this.checkCategoryCompletion(this.images, true);
  }

  setDictionaryInstantDone(): void {
    this.dictionary.state = 'done';
    this.dictionaryComplete = true;
  }

  setVoicesInstantDone(): void {
    this.voices.state = 'done';
    this.voicesComplete = true;
  }

  setImagesInstantDone(): void {
    this.images.state = 'done';
    this.imagesComplete = true;
  }

  onContinueWithLocalVoice(): void {
    this.continueWithLocalVoice.emit();
  }

  getProgress(cat: PreloadCategory): number {
    if (cat.state === 'done') { return 1; }
    if (cat.total === 0) { return 0; }
    return (cat.loaded + cat.failed) / cat.total;
  }

  getPercent(cat: PreloadCategory): number {
    return Math.round(this.getProgress(cat) * 100);
  }

  ngOnDestroy(): void {
    if (this.globalTimeout) { clearTimeout(this.globalTimeout); }
    if (this.tipInterval) { clearInterval(this.tipInterval); }
  }

  private startCategoryLoading(cat: PreloadCategory): void {
    if (cat.state === 'idle') {
      cat.state = 'loading';
    }
    this.ensureGlobalTimeout();
    this.updateStatusMessage();
  }

  private ensureGlobalTimeout(): void {
    if (this.globalTimeout) { return; }
    this.globalTimeout = setTimeout(() => {
      this.finalize();
    }, DictationPreloadComponent.GLOBAL_TIMEOUT_MS);
  }

  private checkCategoryCompletion(cat: PreloadCategory, allRegistered: boolean): void {
    if (cat.state !== 'loading') { return; }
    if (allRegistered && cat.loaded + cat.failed >= cat.total) {
      cat.state = cat.failed > 0 ? 'failed' : 'done';
    }
    this.updateStatusMessage();
    this.checkOverallCompletion();
  }

  private checkOverallCompletion(): void {
    const allDone = this.isCategoryFinished(this.dictionary)
      && this.isCategoryFinished(this.voices)
      && this.isCategoryFinished(this.images);
    if (!allDone) { return; }

    if (this.globalTimeout) { clearTimeout(this.globalTimeout); this.globalTimeout = null; }

    if (this.voices.state === 'failed') {
      this.statusMessage = 'Preload.Status.VoiceFailed';
      this.showContinueButton = true;
    } else {
      this.statusMessage = 'Preload.Status.AllReady';
      setTimeout(() => this.preloadDone.emit(true), this.computeTransitionDelay());
    }
  }

  private finalize(): void {
    this.globalTimeout = null;
    [this.dictionary, this.voices, this.images].forEach(cat => {
      if (cat.state === 'loading') {
        cat.state = cat.failed > 0 || cat.loaded + cat.failed < cat.total ? 'failed' : 'done';
      }
    });
    this.checkOverallCompletion();
    if (!this.showContinueButton) {
      // If voices didn't fail but we timed out, just auto-transition
      if (this.voices.state !== 'failed') {
        this.statusMessage = 'Preload.Status.AllReady';
        setTimeout(() => this.preloadDone.emit(true), this.computeTransitionDelay());
      }
    }
  }

  private computeTransitionDelay(): number {
    const elapsed = Date.now() - this.startTime;
    const remainingForMin = DictationPreloadComponent.MIN_DISPLAY_MS - elapsed;
    return Math.max(DictationPreloadComponent.AUTO_TRANSITION_DELAY_MS, remainingForMin);
  }

  private isCategoryFinished(cat: PreloadCategory): boolean {
    return cat.state === 'done' || cat.state === 'failed';
  }

  private updateStatusMessage(): void {
    if (this.voices.state === 'loading') {
      this.statusMessage = 'Preload.Status.LoadingVoices';
    } else if (this.images.state === 'loading') {
      this.statusMessage = 'Preload.Status.LoadingImages';
    } else if (this.dictionary.state === 'loading') {
      this.statusMessage = 'Preload.Status.Preparing';
    }
  }

  private startTipRotation(): void {
    this.tipInterval = setInterval(() => {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
    }, 4000);
  }
}
