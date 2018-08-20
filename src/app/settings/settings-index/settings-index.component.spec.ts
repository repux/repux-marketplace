import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsIndexComponent } from './settings-index.component';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SettingsService } from '../services/settings.service';

describe('SettingsIndexComponent', () => {
  let component: SettingsIndexComponent;
  let fixture: ComponentFixture<SettingsIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        SharedModule,
        RouterTestingModule,
      ],
      declarations: [ SettingsIndexComponent ],
      providers: [
        { provide: SettingsService, useValue: { daysToDeliver: 14 } }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
