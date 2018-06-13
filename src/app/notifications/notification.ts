import { NotificationType } from './notification-type';

export class Notification {
  data;
  read: boolean;
  type: NotificationType;

  constructor(type: NotificationType, data, read: boolean = false) {
    this.type = type;
    this.data = data;
    this.read = read;
  }
}
