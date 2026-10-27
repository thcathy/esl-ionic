import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

import {Dictation} from '../../entity/dictation';
import {AnalyticsService} from '../../services/analytics.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {ShareService} from '../../services/share.service';

@Component({
  selector: 'app-share-dictation-modal',
  templateUrl: './share-dictation-modal.component.html',
  styleUrls: ['./share-dictation-modal.component.scss'],
  standalone: false,
})
export class ShareDictationModalComponent implements OnInit, OnDestroy {
  @Input() dictation: Dictation;

  url = '';
  qrSrc = '';
  qrFailed = false;
  canSystemShare = false;

  private alive = true;
  private loading: Promise<void> | null = null;
  private savingQr = false;

  constructor(
    private readonly modalController: ModalController,
    private readonly shareService: ShareService,
    private readonly analytics: AnalyticsService,
    private readonly ionic: IonicComponentService,
    private readonly translate: TranslateService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this.alive = false;
  }

  ngOnInit(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  private async load(): Promise<void> {
    const url = this.shareService.dictationShareUrl(this.dictation);
    if (!url) {
      await this.modalController.dismiss().catch(() => undefined);
      return;
    }
    this.url = url;
    const [canSystemShare, qr] = await Promise.all([
      this.shareService.canUseSystemShare(),
      this.loadQr(this.url),
    ]);
    if (!this.alive) {
      return;
    }
    this.canSystemShare = canSystemShare;
    this.qrSrc = qr.src;
    this.qrFailed = qr.failed;
    if (qr.src) {
      this.analytics.share('qr_view');
    }
    this.changeDetector.detectChanges();
  }

  close(): void {
    void this.modalController.dismiss();
  }

  async copyLink(): Promise<void> {
    try {
      await this.shareService.copyLink(this.url);
      this.analytics.share('copy');
      void this.ionic.showToastMessage(this.translate.instant('Link copied'));
    } catch {
      void this.ionic.showToastMessage(this.translate.instant('Could not copy the link. Please try again.'));
    }
  }

  async saveQr(): Promise<void> {
    if (!this.qrSrc || this.savingQr) {
      return;
    }
    this.savingQr = true;
    try {
      const saved = await this.shareService.saveQrPng(
        await this.savedQrImage(),
        `funfunspell-dictation-${this.dictation.id}.png`,
      );
      if (saved) {
        this.analytics.share('qr_download');
      }
    } finally {
      this.savingQr = false;
    }
  }

  async systemShare(): Promise<void> {
    try {
      await this.shareService.nativeShare(this.dictation);
      this.analytics.share('native');
    } catch {
      return;
    }
  }

  private async savedQrImage(): Promise<string> {
    try {
      return await this.shareService.qrCardDataUrl(this.url, this.dictation.title);
    } catch {
      return this.qrSrc;
    }
  }

  private async loadQr(url: string): Promise<{src: string; failed: boolean}> {
    try {
      return {src: await this.shareService.qrDataUrl(url), failed: false};
    } catch {
      return {src: '', failed: true};
    }
  }
}
