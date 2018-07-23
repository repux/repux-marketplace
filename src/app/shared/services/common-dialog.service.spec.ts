import { CommonDialogService } from './common-dialog.service';
import { MaterialModule } from '../../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { getTestBed, TestBed } from '@angular/core/testing';
import { TransactionDialogComponent } from '../components/transaction-dialog/transaction-dialog.component';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

describe('CommonDialogService', () => {
  let service: CommonDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConfirmationDialogComponent,
        TransactionDialogComponent
      ],
      imports: [
        NoopAnimationsModule,
        MaterialModule
      ]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          ConfirmationDialogComponent,
          TransactionDialogComponent
        ]
      }
    });

    const testbed = getTestBed();
    service = testbed.get(CommonDialogService);
  });

  describe('#alert()', () => {
    it('should open ConfirmationDialogComponent with proper properties', () => {
      const message = 'MESSAGE';
      const title = 'TITLE';

      const dialogRef = service.alert(message, title);

      expect(dialogRef.componentInstance.title).toBe(title);
      expect(dialogRef.componentInstance.body).toBe(message);
      expect(dialogRef.componentInstance.confirmButton).toBe('Ok');
      expect(dialogRef.componentInstance.cancelButton).toBeNull();
    });

    it('should open ConfirmationDialogComponent with changed confirmation button label', () => {
      const message = 'MESSAGE';
      const title = 'TITLE';
      const confirmButton = 'CONFIRM';

      const dialogRef = service.alert(message, title, confirmButton);

      expect(dialogRef.componentInstance.title).toBe(title);
      expect(dialogRef.componentInstance.body).toBe(message);
      expect(dialogRef.componentInstance.confirmButton).toBe(confirmButton);
      expect(dialogRef.componentInstance.cancelButton).toBeNull();
    });
  });
});
