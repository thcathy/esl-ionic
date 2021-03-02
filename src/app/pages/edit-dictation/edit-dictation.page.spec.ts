import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { EditDictationPage } from './edit-dictation.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {dictation1} from '../../../testing/test-data';
import {MemberDictationService} from '../../services/dictation/member-dictation.service';
import {AuthServiceSpy, NavigationServiceSpy, StorageSpy} from '../../../testing/mocks-ionic';
import {AuthService} from '../../services/auth.service';
import {of} from 'rxjs';
import {NavigationService} from '../../services/navigation.service';
import {Storage} from '@ionic/storage';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';
import {ActivatedRoute} from '@angular/router';
import {By} from '@angular/platform-browser';
import {Dictation} from '../../entity/dictation';

fdescribe('EditDictationPage', () => {
  let component: EditDictationPage;
  let fixture: ComponentFixture<EditDictationPage>;
  let memberDictationServiceSpy, authServiceSpy, storageSpy, activateRouteStub, navigationServiceSpy;

  beforeEach(async(() => {
    memberDictationServiceSpy = jasmine.createSpyObj('MemberDictationService', ['createOrAmendDictation']);
    authServiceSpy = AuthServiceSpy();
    storageSpy = StorageSpy();
    activateRouteStub = new ActivatedRouteStub();
    navigationServiceSpy = NavigationServiceSpy();

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
        { provide: ActivatedRoute, useValue: activateRouteStub },
        { provide: NavigationService, useValue: navigationServiceSpy }
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

    component.vocabulary.setValue(`
      apple
           banana
               cup
    `);
    component.showImage.setValue(true);
    component.type.setValue('word');
    component.startDictationNow();

    const dictation = navigationServiceSpy.startDictation.calls.mostRecent().args[0] as Dictation;
    expect(dictation.showImage).toBeTrue();
    expect(dictation.vocabs.length).toEqual(3);
    expect(dictation.vocabs[0].word).toEqual('apple');
    expect(dictation.vocabs[1].word).toEqual('banana');
    expect(dictation.vocabs[2].word).toEqual('cup');

    component.vocabulary.setValue(` apple , banana,cup`);
    component.startDictationNow();
    const dictation2 = navigationServiceSpy.startDictation.calls.mostRecent().args[0] as Dictation;
    expect(dictation2.vocabs.length).toEqual(3);
    expect(dictation2.vocabs[0].word).toEqual('apple');
    expect(dictation2.vocabs[1].word).toEqual('banana');
    expect(dictation2.vocabs[2].word).toEqual('cup');
  }));

  it('start instant dictation by article will navigate to start dictation page', fakeAsync(() => {
    activateRouteStub.setQueryParamMap({ mode: 'Start' });
    authServiceSpy.isAuthenticated.and.returnValue(false);
    componentViewDidEnter();

    component.article.setValue(`This is a article.`);
    component.sentenceLength.setValue('Short');
    component.type.setValue('sentence');
    component.startDictationNow();

    const dictation = navigationServiceSpy.startDictation.calls.mostRecent().args[0] as Dictation;
    expect(dictation.sentenceLength).toEqual('Short');
    expect(dictation.article).toEqual('This is a article.');
  }));
});
