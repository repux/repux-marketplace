import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveDialogComponent } from './incentive-dialog.component';
import { MaterialModule } from '../../../material.module';
import { MatDialogRef } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';

describe('IncentiveDialogComponent', () => {
  let component: IncentiveDialogComponent;
  let fixture: ComponentFixture<IncentiveDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule
      ],
      declarations: [ IncentiveDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncentiveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
