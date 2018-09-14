import { Component } from '@angular/core';

const SCORING_DATA: { action: string, score: number }[] = [
  { action: 'Seller with the most popular file for download (in overall)', score: 100 },
  { action: 'Seller with the highest average rating  (in overall)', score: 90 },
  { action: 'Top 10 Sellers (except the first one)', score: 70 },
  { action: 'Any seller who listed google analytics data of a unique webpage', score: 10 },
  { action: 'Random seller', score: 100 },
  { action: 'Random buyer', score: 100 },
  { action: 'Seller with the most popular file for download (daily)', score: 5 },
  { action: 'Enable push notifications', score: 1 }
];

@Component({
  selector: 'app-incentive',
  templateUrl: './incentive.component.html',
  styleUrls: [ './incentive.component.scss' ]
})
export class IncentiveComponent {
  scoring = SCORING_DATA;

  constructor() {
  }
}
