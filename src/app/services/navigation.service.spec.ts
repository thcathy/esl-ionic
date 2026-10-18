import {NavigationService} from './navigation.service';
import {Router} from '@angular/router';

describe('NavigationService.openContactUs', () => {
  it('opens the in-app contact page', () => {
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const service = new NavigationService(
      router,
      null,
      null,
      null,
      null,
      null,
    );

    service.openContactUs();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/contact-us'], {queryParams: {}});
  });
});
