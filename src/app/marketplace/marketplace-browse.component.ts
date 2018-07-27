import { Component } from '@angular/core';

@Component({
  selector: 'app-marketplace-browse',
  templateUrl: './marketplace-browse.component.html',
  styleUrls: [ './marketplace-browse.component.scss' ]
})
export class MarketplaceBrowseComponent {
  public staticQuery = {
    bool: {
      must_not: [
        { match: { disabled: true } }
      ]
    }
  };

  constructor() {}
}


