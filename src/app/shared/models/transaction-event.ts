import { TransactionEventType } from '../enums/transaction-event-type';
import { TransactionReceipt } from '@repux/repux-web3-api';
import { Transaction } from '../services/transaction.service';

export interface TransactionEvent {
  type: TransactionEventType;
  receipt?: TransactionReceipt;
  error?: Error;
  transactionObject?: Transaction;
}
