import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VocabSelectionComponent } from './vocab-selection.component';
import {SharedTestModule} from '../../../testing/shared-test.module';

describe('VocabSelectionComponent', () => {
  let component: VocabSelectionComponent;
  let fixture: ComponentFixture<VocabSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VocabSelectionComponent ],
      imports: [SharedTestModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VocabSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
