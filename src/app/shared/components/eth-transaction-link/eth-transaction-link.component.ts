import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-eth-transaction-link',
  templateUrl: './eth-transaction-link.component.html'
})
export class EthTransactionLinkComponent {
  @Input() transactionHash: string;
  @Input() label: string;

  etherscanUrl = environment.etherscanUrl;
}
