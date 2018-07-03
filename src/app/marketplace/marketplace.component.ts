import { Component } from '@angular/core';
import { ProductCreatorDialogComponent } from './components/product-creator-dialog/product-creator-dialog.component';
import { MatDialog } from '@angular/material';
import { map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs/index';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: [ './marketplace.component.scss' ]
})
export class MarketplaceComponent {
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
    this._dialog.open(ProductCreatorDialogComponent, {
      disableClose: true
    });
  }
}
