import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-marketplace-rating',
  styleUrls: [ './marketplace-rating.component.scss' ],
  templateUrl: './marketplace-rating.component.html'
})
export class MarketplaceRatingComponent {
  @Input() rating = new BigNumber(0);
  @Input() displayStar = true;
  @Input() displayLabel = true;
  @Input() minRate = environment.repux.minProductRate;
  @Input() maxRate = environment.repux.maxProductRate;

  get availableRates() {
    return Array.from(Array(this.maxRate - this.minRate + 1).keys()).map(key => key + this.minRate);
  }

  get percentageRating(): number {
    return this.rating
      .div(this.maxRate)
      .times(100)
      .toNumber();
  }
}
