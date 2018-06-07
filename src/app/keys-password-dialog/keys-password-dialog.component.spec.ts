import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeysPasswordDialogComponent } from './keys-password-dialog.component';
import { MatDialogModule, MatDialogRef, MatInputModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RepuxLibService } from '../services/repux-lib.service';
import { KeyStoreService } from '../services/key-store.service';

describe('KeysPasswordDialogComponent', () => {
  let component: KeysPasswordDialogComponent;
  let fixture: ComponentFixture<KeysPasswordDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeysPasswordDialogComponent ],
      imports: [
        MatDialogModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: RepuxLibService, useValue: {} },
        KeyStoreService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeysPasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
