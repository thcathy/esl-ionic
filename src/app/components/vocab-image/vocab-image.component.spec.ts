import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {SharedTestModule} from '../../../testing/shared-test.module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {VocabImageComponent} from './vocab-image';
import {AILoadingImage, defaultImage} from '../../entity/dictation';

describe('VocabImageComponent', () => {
  let component: VocabImageComponent;
  let fixture: ComponentFixture<VocabImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VocabImageComponent ],
      imports: [
        SharedTestModule.forRoot(),
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('default image if no images input', () => {
    component.images = null;
    component.ngOnChanges(null);
    expect(component.imageBase64).toEqual(defaultImage[0]);

    component.images = [];
    component.ngOnChanges(null);
    expect(component.imageBase64).toEqual(defaultImage[0]);
  });

  it('AI loading image if no images input', () => {
    component.AIImage = true;
    component.images = null;
    component.ngOnChanges(null);
    expect(component.imageBase64).toEqual(AILoadingImage[0]);

    component.images = [];
    component.ngOnChanges(null);
    expect(component.imageBase64).toEqual(defaultImage[0]);
  });

});
