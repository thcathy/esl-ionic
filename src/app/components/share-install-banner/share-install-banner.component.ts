import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {StoreBadge} from '../../services/analytics-events';
import {AnalyticsService} from '../../services/analytics.service';
import {AppService} from '../../services/app.service';
import {
  APP_STORE_BADGE_URL,
  APP_STORE_URL,
  PLAY_STORE_BADGE_URL,
  PLAY_STORE_URL,
} from '../../utils/store-links';

@Component({
  selector: 'app-share-install-banner',
  templateUrl: './share-install-banner.component.html',
  styleUrls: ['./share-install-banner.component.scss'],
  standalone: false,
})
export class ShareInstallBannerComponent implements OnInit {
  readonly appStoreUrl = APP_STORE_URL;
  readonly appStoreBadgeUrl = APP_STORE_BADGE_URL;
  readonly playStoreUrl = PLAY_STORE_URL;
  readonly playStoreBadgeUrl = PLAY_STORE_BADGE_URL;
  private dismissed = false;

  constructor(
    private readonly appService: AppService,
    private readonly router: Router,
    private readonly analytics: AnalyticsService,
  ) {}

  ngOnInit(): void {
    this.analytics.shareBannerImpress();
  }

  get visible(): boolean {
    if (this.dismissed || this.appService.isApp()) {
      return false;
    }
    return this.router.url.split(/[?#]/)[0].startsWith('/link/dictation-view');
  }

  onBadge(store: StoreBadge): void {
    this.analytics.shareBannerClick(store);
  }

  dismiss(): void {
    this.dismissed = true;
  }
}
