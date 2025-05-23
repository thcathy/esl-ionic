import {ComponentFixture, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ArticleDictationOptionsComponent} from './article-dictation-options.component';
import {SharedTestModule} from "../../../testing/shared-test.module";
import {StorageSpy} from "../../../testing/mocks-ionic";
import {UIOptionsService} from "../../services/ui-options.service";
import {importProvidersFrom} from "@angular/core";

describe('ArticleDictationOptionsComponent', () => {
  let component: ArticleDictationOptionsComponent;
  let fixture: ComponentFixture<ArticleDictationOptionsComponent>;
  let storageSpy = StorageSpy();

  beforeEach(waitForAsync(() => {
    storageSpy = StorageSpy();

    TestBed.configureTestingModule({
      declarations: [ ArticleDictationOptionsComponent ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      providers: [
        { provide: UIOptionsService, useValue: new UIOptionsService(storageSpy) },
        importProvidersFrom(IonicModule.forRoot({}))
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDictationOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('init will get options from storage', fakeAsync(() => {
    expect(storageSpy.get).toHaveBeenCalledTimes(3);
  }));

  it('option change will call storage.set', fakeAsync(() => {
    component.optionChanged({
      'detail': {'checked': true}
    }, component.caseSensitiveKey);
    expect(storageSpy.set).toHaveBeenCalledTimes(1);
  }));
});
