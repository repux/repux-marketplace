import { MatDialogModule } from '@angular/material';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationDialogComponent ],
      imports: [
        MatDialogModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  describe('#DOM', () => {
    it('should display all elements properly', () => {
      const element = fixture.nativeElement;

      component.title = 'TITLE';
      component.body = 'BODY';
      component.confirmButton = 'CONFIRM';
      component.cancelButton = 'CANCEL';

      fixture.detectChanges();

      expect(element.querySelector('.title').textContent.trim()).toBe(component.title);
      expect(element.querySelector('.body').textContent.trim()).toBe(component.body);
      expect(element.querySelector('.confirm-button').textContent.trim()).toBe(component.confirmButton);
      expect(element.querySelector('.cancel-button').textContent.trim()).toBe(component.cancelButton);
    });
  });
});
