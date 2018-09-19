import { DataProductUpdateAction } from '@repux/repux-web3-api';

export interface DataProductEvent {
  dataProductAddress: string;
  userAddress: string;
  action: DataProductUpdateAction;
  blockNumber: number;
}
