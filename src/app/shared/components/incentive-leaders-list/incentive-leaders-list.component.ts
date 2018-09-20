import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-incentive-leaders-list',
  templateUrl: './incentive-leaders-list.component.html',
  styleUrls: [ './incentive-leaders-list.component.scss' ]
})
export class IncentiveLeadersListComponent {
  @Input() items: any[] = [];
  @Input() title: string;
  @Input() columns = [ 'seller', 'product', 'purchasesNumber' ];

  etherscanUrl = environment.etherscanUrl;

  getSellerAddress(seller: any): string {
    if (this.columns.includes('rating')) {
      return seller.key;
    }

    return seller.product.ownerAddress;
  }
}
