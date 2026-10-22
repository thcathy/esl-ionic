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

  constructor(
    private modalController: ModalController,
    private shareService: ShareService,
    private analytics: AnalyticsService,
    private ionic: IonicComponentService,
    private translate: TranslateService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this.alive = false;
  }

  ngOnInit(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  private async load(): Promise<void> {
    this.url = this.shareService.dictationShareUrl(this.dictation);
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

  saveQr(): void {
    if (!this.qrSrc) {
      return;
    }
    const id = this.dictation?.id ?? 'qr';
    this.shareService.saveQrPng(this.qrSrc, `funfunspell-dictation-${id}.png`);
    this.analytics.share('qr_download');
  }

  async systemShare(): Promise<void> {
    try {
      await this.shareService.nativeShare(this.dictation);
      this.analytics.share('native');
    } catch {
      return;
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
