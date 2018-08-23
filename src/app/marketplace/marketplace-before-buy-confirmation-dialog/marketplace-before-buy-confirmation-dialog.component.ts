import { Component, Input } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-marketplace-before-buy-confirmation-dialog',
  templateUrl: './marketplace-before-buy-confirmation-dialog.component.html',
  styleUrls: [ './marketplace-before-buy-confirmation-dialog.component.scss' ]
})
export class MarketplaceBeforeBuyConfirmationDialogComponent {
  @Input() dataProduct: DataProduct;
  currencyFormat = environment.repux.currency.format;
}
