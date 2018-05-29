import { Injectable } from '@angular/core';
import RepuxLib from '@repux/repux-lib';
import { IpfsService } from './ipfs.service';

@Injectable({
  providedIn: 'root'
})
export class RepuxLibService {
  private library: RepuxLib;

  constructor(public ipfsService: IpfsService) {
    this.library = new RepuxLib(this.ipfsService.getInstance());
  }

  getInstance(): RepuxLib {
    return this.library;
  }

  getClass(): RepuxLib {
    return RepuxLib;
  }
}
