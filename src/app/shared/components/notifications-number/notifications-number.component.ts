import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notifications-number',
  templateUrl: './notifications-number.component.html',
  styleUrls: [ './notifications-number.component.scss' ]
})
export class NotificationsNumberComponent {
  @Input() number: number;

  @Input() maxNumber: number;

  get displayedText() {
    if (this.number >= this.maxNumber) {
      return `${this.maxNumber - 1}+`;
    }

    return this.number;
  }
}
