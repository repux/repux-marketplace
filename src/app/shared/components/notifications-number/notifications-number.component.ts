import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notifications-number',
  templateUrl: './notifications-number.component.html',
  styleUrls: [ './notifications-number.component.scss' ]
})
export class NotificationsNumberComponent {
  @Input() number: number;
}
