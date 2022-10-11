import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {IonicModule, IonToggle} from '@ionic/angular';

import { ArticleDictationOptionsComponent } from './article-dictation-options.component';
import {SharedTestModule} from "../../../testing/shared-test.module";

describe('ArticleDictationOptionsComponent', () => {
  let component: ArticleDictationOptionsComponent;
  let fixture: ComponentFixture<ArticleDictationOptionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleDictationOptionsComponent, IonToggle ],
      imports: [
        SharedTestModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDictationOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
