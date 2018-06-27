import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html'
})
export class ConfirmationDialogComponent {
  @Input() title;
  @Input() body;
  @Input() confirmButton = 'Yes';
  @Input() cancelButton = 'No';

  constructor() {
  }
}
