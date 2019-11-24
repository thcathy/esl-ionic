import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {DictationViewPage} from './dictation-view.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {DictationService} from '../../services/dictation/dictation.service';
import {ActivatedRoute} from '@angular/router';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';
import {dictation1} from '../../../testing/test-data';
import {of} from 'rxjs';

fdescribe('DictationViewPage', () => {
  let component: DictationViewPage;
  let fixture: ComponentFixture<DictationViewPage>;
  let dictationServiceSpy;
  let activateRouteStub;

  beforeEach(async(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['getById']);
    dictationServiceSpy.getById.and.returnValue(of(dictation1));
    activateRouteStub = new ActivatedRouteStub();

    TestBed.configureTestingModule({
      declarations: [ DictationViewPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DictationService, useValue: dictationServiceSpy},
        { provide: ActivatedRoute, useValue: activateRouteStub }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('input with dictation Id will call get dictation from service', fakeAsync(() => {
    activateRouteStub.setParamMap({ dictationId: 1 });
    tick();
    expect(dictationServiceSpy.getById.calls.count()).toEqual(1);
    expect(component.dictation.id).toEqual(1);
  }));
});
