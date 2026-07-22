import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {SharedTestModule} from '../../../testing/shared-test.module';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {VocabImageComponent} from './vocab-image';
import {defaultImage} from '../../entity/dictation';

describe('VocabImageComponent', () => {
  let component: VocabImageComponent;
  let fixture: ComponentFixture<VocabImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VocabImageComponent ],
      imports: [SharedTestModule.forRoot()],
      providers: [provideNoopAnimations()],
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

  it('uses default placeholder when AI image is on but images are missing', () => {
    component.AIImage = true;
    component.images = null;
    component.ngOnChanges(null);
    expect(component.imageBase64).toEqual(defaultImage[0]);
    expect(component.usingPlaceholder).toBeTrue();
  });

  it('shows AI generated note for unverified images only', () => {
    component.imageUnverified = true;
    component.images = ['data:image/png;base64,abc'];
    component.ngOnChanges(null);
    expect(component.showAIGeneratedNote).toBeTrue();

    component.images = null;
    component.ngOnChanges(null);
    expect(component.showAIGeneratedNote).toBeFalse();

    component.imageUnverified = false;
    component.images = ['data:image/png;base64,abc'];
    component.ngOnChanges(null);
    expect(component.showAIGeneratedNote).toBeFalse();
  });

});
