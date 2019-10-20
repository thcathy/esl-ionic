import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';

import { AccountPage } from './account.page';
import {member1} from '../../../testing/test-data';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

describe('AccountPage', () => {
  let component: AccountPage;
  let fixture: ComponentFixture<AccountPage>;
  let pageElement: HTMLElement;

  beforeEach(async(() => {
    const activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['']);
    activatedRoute.data = of({member: member1});

    TestBed.configureTestingModule({
      declarations: [ AccountPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute}
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPage);
    component = fixture.componentInstance;
    pageElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show user information in html', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    const input = pageElement.querySelector('#userIdInput') as HTMLInputElement;
    expect(input.value).toEqual('tester1');
  }));
});
