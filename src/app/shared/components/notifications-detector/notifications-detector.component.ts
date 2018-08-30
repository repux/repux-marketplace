import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetamaskStatus, WalletService } from '../../../services/wallet.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { NotificationPermission, WebpushNotificationService } from '../../../services/webpush-notification.service';
import { MatDialog } from '@angular/material';
import {
  NotificationsSubscriptionInstructionComponent
} from '../notification-subscription-instruction/notifications-subscription-instruction.component';

const Messages = {
  // tslint:disable:max-line-length
  [ NotificationPermission.Default ]: `To be notified about status of your purchases,  please turn your notifications on.`,
  [ NotificationPermission.Denied ]: `You have denied permission to display notifications. To be notified about status of your purchases,  please turn your notifications on.`
};

@Component({
  selector: 'app-notifications-detector',
  templateUrl: './notifications-detector.component.html',
  styleUrls: [ './notifications-detector.component.scss' ]
})
export class NotificationsDetectorComponent implements OnInit, OnDestroy {

  status = NotificationPermission.Granted;
  walletStatus;

  statuses = NotificationPermission;
  walletStatuses = MetamaskStatus;

  message: string;

  private walletSubscription: Subscription;
  private notificationSubscription: Subscription;

  constructor(
    private matDialog: MatDialog,
    private walletService: WalletService,
    private webpushNotificationService: WebpushNotificationService) {
  }

  howToAllow() {
    this.matDialog.open(NotificationsSubscriptionInstructionComponent);
  }

  ngOnInit(): void {
    this.walletSubscription = this.walletService.getMetamaskStatus().subscribe(status => {
      this.walletStatus = status;
    });

    this.notificationSubscription = this.webpushNotificationService.getNotificationPermission().subscribe(permission => {
      this.status = permission;
      if (Messages[ this.status ]) {
        this.message = Messages[ this.status ];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }

    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
  }
}
