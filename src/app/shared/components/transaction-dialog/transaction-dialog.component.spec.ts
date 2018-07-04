import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionDialogComponent } from './transaction-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material';

describe('TransactionDialogComponent', () => {
  let component: TransactionDialogComponent;
  let fixture: ComponentFixture<TransactionDialogComponent>;
  let matDialogRef;

  beforeEach(fakeAsync(() => {
    matDialogRef = jasmine.createSpyObj('MatDialogRef', [ 'close' ]);

    TestBed.configureTestingModule({
      declarations: [ TransactionDialogComponent ],
      imports: [
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRef }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  describe('#callTransaction()', () => {
    it('should call transaction function and call dialogRef.close method', async () => {
      component.transaction = jasmine.createSpy();
      await component.callTransaction();
      expect(matDialogRef.close.calls.count()).toBe(1);
      expect(component.error).toBeFalsy();
    });

    it('should call transaction and handle error', async () => {
      const error = 'ERROR';
      component.transaction = jasmine.createSpy().and.callFake(function () {
        throw new Error(error);
      });
      await component.callTransaction();
      expect(matDialogRef.close.calls.count()).toBe(0);
      expect(component.error).toBe(error);
    });
  });

  describe('#DOM', () => {
    it('shouldn\'t contain any buttons when there is no error', () => {
      const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
      const body = fixture.debugElement.nativeElement.querySelector('.mat-body-1');
      expect(buttons.length).toBe(0);
      expect(body.textContent.trim()).toBe('Please confirm transaction in MetaMask extension.');
    });

    it('should display cancel and retry button when there is an error', () => {
      const error = 'ERROR';
      component.error = error;
      fixture.detectChanges();

      const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
      const body1 = fixture.debugElement.nativeElement.querySelector('.mat-body-1 div:first-child');
      const body2 = fixture.debugElement.nativeElement.querySelector('.mat-body-1 div:last-child');
      expect(buttons.length).toBe(2);
      expect(body1.textContent.trim()).toBe(error);
      expect(body2.textContent.trim()).toBe('You can retry by clicking button below.');
      expect(buttons[ 0 ].textContent.trim()).toBe('Cancel');
      expect(buttons[ 1 ].textContent.trim()).toBe('Retry');
    });
  });
});
