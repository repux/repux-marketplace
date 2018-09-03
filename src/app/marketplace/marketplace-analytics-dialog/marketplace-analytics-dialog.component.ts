import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { environment } from '../../../environments/environment';
import { OAuthState } from '../../shared/enums/oauth-state';

@Component({
  selector: 'app-marketplace-analytics-dialog',
  templateUrl: './marketplace-analytics-dialog.component.html'
})
export class MarketplaceAnalyticsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<MarketplaceAnalyticsDialogComponent>
  ) {
  }

  get oauthUrl() {
    return 'https://accounts.google.com/o/oauth2/v2/auth?' +
      'client_id=' + environment.google.oauth.clientId +
      '&scope=https://www.googleapis.com/auth/analytics.readonly' +
      '&response_type=token' +
      '&state=' + OAuthState.AnalyticsIntegration +
      '&redirect_uri=' + environment.google.oauth.redirectUri;
  }

  authorize() {
    window.location.assign(this.oauthUrl);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
