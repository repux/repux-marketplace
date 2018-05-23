import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent {
  navLinks = [
    {
      label: 'Dashboard',
      path: 'dashboard'
    },
    {
      label: 'Marketplace',
      path: 'marketplace'
    }
  ];
}
