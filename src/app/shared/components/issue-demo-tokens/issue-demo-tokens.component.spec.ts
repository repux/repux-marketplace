import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueDemoTokensComponent } from './issue-demo-tokens.component';
import { MaterialModule } from '../../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogRef } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IssueDemoTokensComponent', () => {
  let component: IssueDemoTokensComponent;
  let fixture: ComponentFixture<IssueDemoTokensComponent>;

  beforeEach(async(() => {
    const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', [ 'close', 'afterClosed' ]);
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NoopAnimationsModule
      ],
      declarations: [ IssueDemoTokensComponent ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueDemoTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
