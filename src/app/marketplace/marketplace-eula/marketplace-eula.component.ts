import { Component, Input } from '@angular/core';
import { EulaType } from 'repux-lib';

@Component({
  selector: 'app-marketplace-eula',
  templateUrl: './marketplace-eula.component.html'
})
export class MarketplaceEulaComponent {
  @Input() eulaType: EulaType;

  availableTypes = EulaType;
}
