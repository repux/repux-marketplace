import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsIndexComponent } from './settings-index.component';
import { MatButtonModule, MatDialogModule } from '@angular/material';

describe('SettingsIndexComponent', () => {
  let component: SettingsIndexComponent;
  let fixture: ComponentFixture<SettingsIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatButtonModule
      ],
      declarations: [ SettingsIndexComponent ]
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
