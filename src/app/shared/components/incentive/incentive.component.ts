import { Component } from '@angular/core';

const SCORING_DATA: { action: string, score: number }[] = [
  { action: 'Seller with the most popular file - highest number of downloads (in overall)', score: 100 },
  { action: 'Other top 10 file owners (without 1st one)', score: 70 },
  { action: 'Seller with the most ranked file with minimum ranking of 4.0 (in overall)', score: 80 },
  { action: 'Other top 10 file owners (without 1st one)', score: 70 },

  { action: 'Any seller who listed a valid Google Analytics data (one per account)', score: 10 },
  { action: 'Random seller - we\'ll run a smart contract to determine one after the game is finished', score: 100 },
  { action: 'Random buyer - we\'ll run a smart contract to determine one after the game is finished', score: 100 },

  { action: 'Seller with the most popular file for download (daily winner)', score: 5 },
  { action: 'Have push notifications enabled at the test end', score: 5 }
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
