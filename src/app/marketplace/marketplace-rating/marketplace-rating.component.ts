import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DataProductOrder } from '../../shared/models/data-product-order';

@Component({
  selector: 'app-marketplace-rating',
  styleUrls: [ './marketplace-rating.component.scss' ],
  templateUrl: './marketplace-rating.component.html'
})
export class MarketplaceRatingComponent {
  @Input() orders: DataProductOrder[];
  @Input() minRate = environment.repux.minProductRate;
  @Input() maxRate = environment.repux.maxProductRate;

  get ratingSnapshot(): number[] {
    if (!this.orders) {
      return [];
    }

    return this.orders
      .filter(order => order.rating)
      .reduce((acc, current) => {
        acc[ current.rating.toNumber() - 1 ] += 1;
        return acc;
      }, Array.from(Array(this.maxRate - this.minRate + 1)).map(() => 0));
  }

  get ratingSnapshotTotal(): number {
    return this.ratingSnapshot
      .reduce((acc, current) => acc + current, 0);
  }
}
