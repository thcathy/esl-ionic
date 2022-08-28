import { Component } from '@angular/core';
import {AppService} from '../../services/app.service';
import {NavigationService} from '../../services/navigation.service';
import {FFSAuthService} from '../../services/auth.service';
import {Environment} from '@angular/compiler-cli/src/ngtsc/typecheck/src/environment';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: 'footer.html',
  styleUrls: ['footer.scss'],
})
export class FooterComponent {

  text: string;

  constructor(
    public appService: AppService,
    public navigationService: NavigationService,
    public authService: FFSAuthService) {
  }

  get version() { return environment.version; }

}
