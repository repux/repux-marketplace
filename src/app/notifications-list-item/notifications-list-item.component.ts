import { Component, Input, OnInit } from '@angular/core';
import { Eula } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { DataProduct } from '../shared/models/data-product';

@Component({
  selector: 'app-notifications-list-item',
  templateUrl: './notifications-list-item.component.html',
  styleUrls: [ './notifications-list-item.component.scss' ]
})
export class NotificationsListItemComponent implements OnInit {

  @Input() actions: string[];
  @Input() product: DataProduct;
  expanded = false;

  constructor(private ipfsService: IpfsService) {
  }

  ngOnInit() {
  }

  downloadEula(eula: Eula): Promise<void> {
    return this.ipfsService.downloadAndSave(eula.fileHash, eula.fileName);
  }

  toggle() {
    this.expanded = !this.expanded;
  }
}
