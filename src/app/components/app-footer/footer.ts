import {Component} from '@angular/core';
import {AppService} from '../../services/app.service';
import {NavigationService} from '../../services/navigation.service';
import {FFSAuthService} from '../../services/auth.service';
import packageJson from '../../../../package.json';

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
    public authService: FFSAuthService) {
  }

  get version() { return packageJson.version; }

}
