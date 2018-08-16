import { TransactionEventType } from '../enums/transaction-event-type';
import { TransactionReceipt } from 'repux-web3-api';

export interface TransactionEvent {
  type: TransactionEventType;
  receipt?: TransactionReceipt;
  error?: Error;
}
