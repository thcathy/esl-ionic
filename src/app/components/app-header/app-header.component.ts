import {Component, Input} from '@angular/core';
import {FFSAuthService} from '../../services/auth.service';
import {NavigationService} from '../../services/navigation.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: false
})
export class AppHeaderComponent {
  @Input() title = '';
  @Input() showLogo = false;
  @Input() showBackButton = false;

  constructor(
    public authService: FFSAuthService,
    private navigationService: NavigationService,
  ) {}

  openMemberMenu() {
    this.navigationService.navigate('/member-menu');
  }

  goBack() {
    this.navigationService.goBack();
  }
}
