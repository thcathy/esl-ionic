import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyStarterPage } from './vocabulary-starter.page';
import {SharedTestModule} from "../../../testing/shared-test.module";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";

describe('VocabularyStarterPage', () => {
  let component: VocabularyStarterPage;
  let fixture: ComponentFixture<VocabularyStarterPage>;
  let route: ActivatedRoute;

  beforeEach(async(() => {
    route = new ActivatedRoute();
    route.params = Observable.of();

    TestBed.configureTestingModule({
      declarations: [ VocabularyStarterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        SharedTestModule.forRoot(),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyStarterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
