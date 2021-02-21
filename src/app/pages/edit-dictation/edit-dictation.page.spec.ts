import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { EditDictationPage } from './edit-dictation.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {dictation1} from '../../../testing/test-data';
import {MemberDictationService} from '../../services/dictation/member-dictation.service';
import {AuthServiceSpy, StorageSpy} from '../../../testing/mocks-ionic';
import {AuthService} from '../../services/auth.service';
import {of} from 'rxjs';
import {NavigationService} from '../../services/navigation.service';
import {Storage} from '@ionic/storage';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';
import {ActivatedRoute} from '@angular/router';
import {By} from '@angular/platform-browser';

fdescribe('EditDictationPage', () => {
  let component: EditDictationPage;
  let fixture: ComponentFixture<EditDictationPage>;
  let memberDictationServiceSpy, authServiceSpy, storageSpy, activateRouteStub;

  beforeEach(async(() => {
    memberDictationServiceSpy = jasmine.createSpyObj('MemberDictationService', ['createOrAmendDictation']);
    authServiceSpy = AuthServiceSpy();
    storageSpy = StorageSpy();
    activateRouteStub = new ActivatedRouteStub();

    TestBed.configureTestingModule({
      declarations: [ EditDictationPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MemberDictationService, useValue: memberDictationServiceSpy},
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Storage, useValue: storageSpy },
        { provide: ActivatedRoute, useValue: activateRouteStub }
      ]
    })
    .compileComponents();
  }));

  function componentViewDidEnter() {
    component.ionViewDidEnter();
    tick();
    fixture.detectChanges();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDictationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('open dictation page if dictation is saved', fakeAsync(() => {
    memberDictationServiceSpy.createOrAmendDictation.and.returnValue(of(dictation1));
    authServiceSpy.isAuthenticated.and.returnValue(true);
    componentViewDidEnter();

    component.vocabulary.setValue('apple');
    component.saveDictation();
    tick();

    expect(component.isSaved).toBeTruthy();
    expect(component.canDeactivate()).toBeTruthy();
  }));

  it('show create dictation in title in edit mode', fakeAsync(() => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    componentViewDidEnter();

    expect(component.getTitle()).toEqual('Create Dictation');

    const params = {
      'editDictation': dictation1,
    };
    storageSpy.get.and.callFake((param) => params[param]);
    componentViewDidEnter();

    expect(component.getTitle()).toEqual('Create Dictation');
  }));

  it('show start dictation in title in start mode without login', fakeAsync(() => {
    activateRouteStub.setQueryParamMap({ mode: 'Start' });
    authServiceSpy.isAuthenticated.and.returnValue(false);
    componentViewDidEnter();

    expect(component.getTitle()).toEqual('Start Dictation');
  }));

  it('dont show some of the elements in Start mode', fakeAsync(() => {
    activateRouteStub.setQueryParamMap({ mode: 'Start' });
    authServiceSpy.isAuthenticated.and.returnValue(false);
    componentViewDidEnter();

    expect(fixture.nativeElement.querySelector('.input-form .title')).toBeNull();
    expect(fixture.nativeElement.querySelector('.input-form .description')).toBeNull();
    expect(fixture.nativeElement.querySelector('.input-form .suitableAge')).toBeNull();
  }));

  it('show some of the elements in Edit mode', fakeAsync(() => {
    activateRouteStub.setQueryParamMap({ mode: 'Edit' });
    authServiceSpy.isAuthenticated.and.returnValue(true);
    componentViewDidEnter();

    expect(fixture.nativeElement.querySelector('.input-form .title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.input-form .description')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.input-form .suitableAge')).toBeTruthy();
  }));

  it('start instant dictation by single word will navigate to start dictation page', fakeAsync(() => {
    activateRouteStub.setQueryParamMap({ mode: 'Start' });
    authServiceSpy.isAuthenticated.and.returnValue(false);
    componentViewDidEnter();


  }));
});
