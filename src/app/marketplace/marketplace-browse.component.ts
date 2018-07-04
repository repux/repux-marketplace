import { Component } from '@angular/core';
import {
  MarketplaceProductCreatorDialogComponent
} from './marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';
import { MatDialog } from '@angular/material';
import { map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs/index';

@Component({
  selector: 'app-marketplace-browse',
  templateUrl: './marketplace-browse.component.html',
  styleUrls: [ './marketplace-browse.component.scss' ]
})
export class MarketplaceBrowseComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  public staticQuery = {
    bool: {
      must_not: [
        { match: { disabled: true } }
      ]
    }
  };

  constructor(
    private breakpointObserver: BreakpointObserver,
    private _dialog: MatDialog
  ) {
  }

  openProductCreatorDialog() {
    this._dialog.open(MarketplaceProductCreatorDialogComponent, {
      disableClose: true
    });
  }
}
