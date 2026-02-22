import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {DictationViewPage} from './dictation-view.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {DictationService} from '../../services/dictation/dictation.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';
import {dictation1} from '../../../testing/test-data';
import {of} from 'rxjs';

describe('DictationViewPage', () => {
  let component: DictationViewPage;
  let fixture: ComponentFixture<DictationViewPage>;
  let dictationServiceSpy;
  let activateRouteStub;
  let routerSpy;

  beforeEach(waitForAsync(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['getById']);
    dictationServiceSpy.getById.and.returnValue(of(dictation1));
    activateRouteStub = new ActivatedRouteStub();
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    routerSpy.currentNavigation.and.returnValue(null);

    TestBed.configureTestingModule({
      declarations: [ DictationViewPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DictationService, useValue: dictationServiceSpy},
        { provide: Router, useValue: routerSpy },
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

  it('input with navigation extra will not call get dictation from service', fakeAsync(() => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          dictation: JSON.stringify(dictation1),
          showBackButton: true,
        }
      }
    });
    activateRouteStub.setParamMap({});
    tick();
    expect(dictationServiceSpy.getById.calls.count()).toEqual(0);
    expect(component.dictation.title).toEqual('test dictation 1');
    expect(component.showBackButton).toEqual(true);
  }));
});
