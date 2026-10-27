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
import {
  readShareInstallBannerDismissed,
  SHARE_INSTALL_BANNER_DISMISS_KEY,
  showShareInstallBanner,
} from './share-install-banner.logic';

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
  ) {
    this.dismissed = readShareInstallBannerDismissed(this.sessionStorage());
  }

  ngOnInit(): void {
    this.analytics.shareBannerImpress();
  }

  get visible(): boolean {
    return showShareInstallBanner(this.appService.isApp(), this.router.url, this.dismissed);
  }

  onBadge(store: StoreBadge): void {
    this.analytics.shareBannerClick(store);
  }

  dismiss(): void {
    this.dismissed = true;
    try {
      this.sessionStorage()?.setItem(SHARE_INSTALL_BANNER_DISMISS_KEY, '1');
    } catch {
      // Private mode can reject sessionStorage. The in-memory flag still hides the banner.
    }
  }

  private sessionStorage(): Storage | null {
    try {
      return typeof sessionStorage === 'undefined' ? null : sessionStorage;
    } catch {
      return null;
    }
  }
}
