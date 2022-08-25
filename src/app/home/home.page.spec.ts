import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import {
  AlertControllerSpy, AppServiceSpy,
  PlatformSpy,
  StatusBarSpy,
  StorageSpy
} from '../../testing/mocks-ionic';
import { SharedTestModule } from '../../testing/shared-test.module';
import { AppService } from '../services/app.service';
import { HomePage } from './home.page';


describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StatusBar, useValue: StatusBarSpy() },        
        { provide: Platform, useValue: PlatformSpy() },
        { provide: AlertController, useValue: AlertControllerSpy()},
        { provide: Storage, useValue: StorageSpy()},
        { provide: AppService, useValue: AppServiceSpy()}
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
