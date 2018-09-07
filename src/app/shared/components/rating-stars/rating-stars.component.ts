import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss']
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() minRate = environment.repux.minProductRate;
  @Input() maxRate = environment.repux.maxProductRate;

  get availableRates() {
    return Array.from(Array(this.maxRate - this.minRate + 1).keys()).map(key => key + this.minRate);
  }

  get percentageRating(): number {
    return (this.rating / this.maxRate) * 100;
  }

  constructor() { }
}
