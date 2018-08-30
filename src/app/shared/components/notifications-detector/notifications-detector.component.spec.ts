import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsDetectorComponent } from './notifications-detector.component';
import { WalletService } from '../../../services/wallet.service';
import { MatDialog } from '@angular/material';
import { WebpushNotificationService } from '../../../services/webpush-notification.service';

describe('NotificationsDetectorComponent', () => {
  let fixture: ComponentFixture<NotificationsDetectorComponent>;
  let component: NotificationsDetectorComponent;
  let matDialogSpy, walletServiceSpy, webpushNotificationServiceSpy;

  beforeEach(async () => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getMetamaskStatus' ]);
    webpushNotificationServiceSpy = jasmine.createSpyObj('WebpushNotificationService', [ 'getNotificationPermission' ]);

    await TestBed.configureTestingModule({
      declarations: [
        NotificationsDetectorComponent
      ],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: WebpushNotificationService, useValue: webpushNotificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsDetectorComponent);
    component = fixture.debugElement.componentInstance;
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
