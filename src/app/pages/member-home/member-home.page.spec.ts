import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberHomePage } from './member-home.page';
import {SharedTestModule} from "../../../testing/shared-test.module";

describe('MemberHomePage', () => {
  let component: MemberHomePage;
  let fixture: ComponentFixture<MemberHomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberHomePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
