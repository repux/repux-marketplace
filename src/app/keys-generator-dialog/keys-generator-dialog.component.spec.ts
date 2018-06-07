import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MatInputModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeysGeneratorDialogComponent } from './keys-generator-dialog.component';
import { RepuxLibService } from '../services/repux-lib.service';
import { KeyStoreService } from '../services/key-store.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('KeysGeneratorDialogComponent', () => {
  let component: KeysGeneratorDialogComponent;
  let fixture: ComponentFixture<KeysGeneratorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeysGeneratorDialogComponent ],
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
    fixture = TestBed.createComponent(KeysGeneratorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
