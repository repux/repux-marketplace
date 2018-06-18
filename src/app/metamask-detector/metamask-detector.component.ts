import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetamaskStatus, WalletService } from '../services/wallet.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { environment } from '../../environments/environment';

const Messages = {
  // tslint:disable:max-line-length
  [ MetamaskStatus.WrongNetwork ]: `Oops, seems like you're on wrong network! Open MetaMask and please, switch to ${environment.networkName} .`,
  [ MetamaskStatus.NotInstalled ]: 'You need a secure wallet like MetaMask to browse through Marketplace. ' +
  'As soon as the extension is installed the warning will be gone.',
  [ MetamaskStatus.NotLoggedIn ]: 'You need login to MetaMask and import RepuX account.'
};

@Component({
  selector: 'app-metamask-detector',
  templateUrl: './metamask-detector.component.html',
  styleUrls: [ './metamask-detector.component.scss' ]
})
export class MetamaskDetectorComponent implements OnInit, OnDestroy {

  status = MetamaskStatus.Ok;

  statuses = MetamaskStatus;

  message: string;

  subscription: Subscription;

  constructor(private walletService: WalletService) {
  }

  ngOnInit(): void {
    this.subscription = this.walletService.getMetamaskStatus().subscribe(status => {
      this.status = status;
      if (Messages[ this.status ]) {
        this.message = Messages[ this.status ];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
