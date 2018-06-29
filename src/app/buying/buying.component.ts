import { Component } from '@angular/core';

@Component({
  selector: 'app-buying',
  templateUrl: './buying.component.html',
  styleUrls: [ './buying.component.scss' ]
})
export class BuyingComponent {
  navLinks = [
    {
      label: 'Ready to download',
      path: 'ready-to-download',
      items: []
    },
    {
      label: 'Awaiting finalisation',
      path: 'awaiting-finalisation',
      items: []
    }
  ];
}
