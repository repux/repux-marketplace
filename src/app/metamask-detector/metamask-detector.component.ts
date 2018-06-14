import { Component, OnInit } from '@angular/core';
import { MetamaskStatus, WalletService } from '../services/wallet.service';

const Messages = {
  [ MetamaskStatus.NotInstalled ]: 'You need a secure wallet like MetaMask to browse through Marketplace. ' +
  'As soon as the extension is installed the warning will be gone.',
  [ MetamaskStatus.NotLoggedIn ]: 'You need login to MetaMask and import RepuX account.'
};

@Component({
  selector: 'app-metamask-detector',
  templateUrl: './metamask-detector.component.html',
  styleUrls: [ './metamask-detector.component.scss' ]
})
export class MetamaskDetectorComponent implements OnInit {

  status = MetamaskStatus.Ok;

  statuses = MetamaskStatus;

  message: string;

  constructor(private walletService: WalletService) {
  }

  ngOnInit(): void {
    this.walletService.getMetamaskStatus().subscribe(status => {
      this.status = status;
      this.message = Messages[ this.status ];
    });
  }
}
