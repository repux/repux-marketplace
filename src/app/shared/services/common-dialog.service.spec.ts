import { CommonDialogService } from './common-dialog.service';

describe('CommonDialogService', () => {
  let service: CommonDialogService;
  let matDialogSpy;

  beforeEach(() => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    matDialogSpy.open.and.callFake((type) => {
      return {
        componentInstance: new type()
      };
    });

    service = new CommonDialogService(matDialogSpy);
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
