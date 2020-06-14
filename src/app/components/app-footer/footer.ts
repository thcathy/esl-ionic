import { Component } from '@angular/core';
import {AppService} from '../../services/app.service';
import {NavigationService} from '../../services/navigation.service';
import {AuthService} from '../../services/auth.service';

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
    public authService: AuthService) {
  }

}
