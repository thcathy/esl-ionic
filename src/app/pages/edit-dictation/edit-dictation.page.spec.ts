import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { EditDictationPage } from './edit-dictation.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {dictation1} from '../../../testing/test-data';
import { cold } from 'jasmine-marbles';
import {DictationService} from '../../services/dictation/dictation.service';
import {Storage} from '@ionic/storage';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {MemberDictationService} from '../../services/dictation/member-dictation.service';
import {AuthServiceSpy} from '../../../testing/mocks-ionic';
import {AuthService} from '../../services/auth.service';

describe('EditDictationPage', () => {
  let component: EditDictationPage;
  let fixture: ComponentFixture<EditDictationPage>;
  let memberDictationServiceSpy, authServiceSpy;

  beforeEach(async(() => {
    memberDictationServiceSpy = jasmine.createSpyObj('MemberDictationService', ['createOrAmendDictation']);
    authServiceSpy = AuthServiceSpy();

    TestBed.configureTestingModule({
      declarations: [ EditDictationPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MemberDictationService, useValue: memberDictationServiceSpy},
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDictationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('open dictation page if dictation is saved', fakeAsync(() => {
    memberDictationServiceSpy.createOrAmendDictation.and.returnValue(cold('-x|', { x: dictation1 }));
    authServiceSpy.isAuthenticated.and.returnValue(true);

    component.ionViewDidEnter();
    tick();

    component.vocabulary.setValue('apple');
    component.saveDictation();
    tick();

    expect(component.isSaved).toBeTruthy();
    expect(component.canDeactivate()).toBeTruthy();
  }));
});
