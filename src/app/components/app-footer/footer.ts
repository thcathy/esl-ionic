import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Platform} from '@ionic/angular';
import {AppService} from '../../services/app.service';
import {NavigationService} from '../../services/navigation.service';
import {FFSAuthService} from '../../services/auth.service';
import packageJson from '../../../../package.json';

/** Ionic `md` breakpoint — same width as the footer `size-md` columns. */
const WIDE_VIEWPORT_PX = 768;

@Component({
    selector: 'app-footer',
    templateUrl: 'footer.html',
    styleUrls: ['footer.scss'],
    standalone: false
})
export class FooterComponent {

  text: string;

  constructor(
    public appService: AppService,
    public navigationService: NavigationService,
    public authService: FFSAuthService,
    private platform: Platform,
    private router: Router,
  ) {
  }

  get version() { return packageJson.version; }

  /** Viewport ≥ 768px. Read on each check; do not cache it from a resize listener. */
  get isWide(): boolean {
    return this.platform.width() >= WIDE_VIEWPORT_PX;
  }

  /** Current router path is the home page. */
  get isHome(): boolean {
    return this.router.url.split(/[?#]/)[0] === '/home';
  }

  /**
   * Wide web: every page. Native app and narrow web: home only.
   */
  get showFullFooter(): boolean {
    return (!this.appService.isApp() && this.isWide) || this.isHome;
  }

  /** Credit and version when the full columns are hidden. */
  get showSlimFooter(): boolean {
    return !this.showFullFooter;
  }

  /** Banner rides with the full footer. */
  get showBanner(): boolean {
    return this.showFullFooter;
  }

}
