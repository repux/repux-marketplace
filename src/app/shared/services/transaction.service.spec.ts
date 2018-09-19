import { Transaction, TransactionService } from './transaction.service';
import { BlockchainTransactionScope } from '../enums/blockchain-transaction-scope';
import { ActionButtonType } from '../enums/action-button-type';
import { BehaviorSubject, of } from 'rxjs';
import Wallet from '../models/wallet';
import BigNumber from 'bignumber.js';
import { TransactionEvent } from '../models/transaction-event';
import { TransactionStatus } from '@repux/repux-web3-api';
import { TransactionEventType } from '../enums/transaction-event-type';

describe('TransactionService', () => {
  let service: TransactionService;

  let repuxWeb3ServiceSpy;
  let storageServiceSpy;
  let walletServiceSpy;

  const wallet = new Wallet('0x02', new BigNumber(0), new BigNumber(1));

  beforeEach(() => {
    repuxWeb3ServiceSpy = jasmine.createSpyObj('RepuxWeb3Service', [ 'getRepuxApiInstance' ]);
    storageServiceSpy = jasmine.createSpyObj('StorageService', [ 'getItem', 'setItem' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue(of(wallet));

    service = new TransactionService(repuxWeb3ServiceSpy, storageServiceSpy, walletServiceSpy);
  });

  describe('#addTransaction()', () => {
    it('should add transaction to currentTransactions', () => {
      const transaction = {
        transactionHash: '0x00',
        identifier: '0x01',
        scope: BlockchainTransactionScope.DataProduct,
        blocksAction: ActionButtonType.Buy
      } as Transaction;

      service.addTransaction(transaction);

      expect(service[ 'currentTransactionsSubject' ].getValue()).toEqual([ transaction ]);
    });
  });

  describe('#addDroppedTransaction()', () => {
    it('should add transaction to droppedTransactions', () => {
      const transaction = {
        transactionHash: '0x00',
        identifier: '0x01',
        scope: BlockchainTransactionScope.DataProduct,
        blocksAction: ActionButtonType.Buy
      } as Transaction;

      service[ 'addDroppedTransaction' ](transaction);

      expect(service[ 'droppedTransactionsSubject' ].getValue()).toEqual([ transaction ]);
    });
  });

  describe('#getTransactions()', () => {
    it('should return currentTransactions as an observable', () => {
      const transaction = {
        transactionHash: '0x00',
        identifier: '0x01',
        scope: BlockchainTransactionScope.DataProduct,
        blocksAction: ActionButtonType.Buy
      } as Transaction;

      service.addTransaction(transaction);

      return new Promise(resolve => {
        service.getTransactions().subscribe(transactions => {
          if (transactions.length > 0) {
            expect(transactions).toEqual([ transaction ]);
            resolve();
          }
        });
      });
    });
  });

  describe('#getDroppedTransactions()', () => {
    it('should return droppedTransactions as an observable', () => {
      const transaction = {
        transactionHash: '0x00',
        identifier: '0x01',
        scope: BlockchainTransactionScope.DataProduct,
        blocksAction: ActionButtonType.Buy
      } as Transaction;

      service[ 'addDroppedTransaction' ](transaction);

      return new Promise(resolve => {
        service.getDroppedTransactions().subscribe(transactions => {
          if (transactions.length > 0) {
            expect(transactions).toEqual([ transaction ]);
            resolve();
          }
        });
      });
    });
  });

  describe('#handleTransaction()', () => {
    it('should call transaction method and emit all required events', () => {
      const transactionHash = '0x01';
      const subject = new BehaviorSubject<TransactionEvent>(undefined);
      const scope = BlockchainTransactionScope.DataProduct;
      const identifier = '0x00';
      const blocksAction = ActionButtonType.Buy;
      const transaction = jasmine.createSpy().and.returnValue(Promise.resolve(transactionHash));

      service.getTransactionReceipt = jasmine.createSpy().and.returnValue(Promise.resolve({ status: TransactionStatus.SUCCESSFUL }));
      service.addTransaction = jasmine.createSpy();
      service.removeTransaction = jasmine.createSpy();

      return new Promise(async resolve => {
        let counter = 0;
        subject.subscribe(transactionEvent => {
          if (counter === 1) {
            expect(transactionEvent.type).toBe(TransactionEventType.Created);
          } else if (counter === 2) {
            expect(transactionEvent.type).toBe(TransactionEventType.Confirmed);
          } else if (counter === 3) {
            expect(transactionEvent.type).toBe(TransactionEventType.Mined);
            resolve();
          }

          counter++;
        });

        await service.handleTransaction(subject, scope, identifier, blocksAction, transaction);

        expect(service.getTransactionReceipt).toHaveBeenCalled();
        expect(service.addTransaction).toHaveBeenCalled();
        expect(service.removeTransaction).toHaveBeenCalled();
      });
    });

    it('should handle rejected transaction', () => {
      const errorMessage = 'Some error';
      const subject = new BehaviorSubject<TransactionEvent>(undefined);
      const scope = BlockchainTransactionScope.DataProduct;
      const identifier = '0x00';
      const blocksAction = ActionButtonType.Buy;
      const transaction = jasmine.createSpy().and.returnValue(Promise.reject(new Error(errorMessage)));

      return new Promise(async resolve => {
        let counter = 0;
        subject.subscribe(transactionEvent => {
          if (counter === 1) {
            expect(transactionEvent.type).toBe(TransactionEventType.Created);
          } else if (counter === 2) {
            expect(transactionEvent.type).toBe(TransactionEventType.Rejected);
            expect(transactionEvent.error.message).toBe(errorMessage);
            resolve();
          }

          counter++;
        });

        await service.handleTransaction(subject, scope, identifier, blocksAction, transaction);
      });
    });

    it('should handle dropped transaction', () => {
      const transactionHash = '0x01';
      const errorMessage = 'Transaction dropped';
      const subject = new BehaviorSubject<TransactionEvent>(undefined);
      const scope = BlockchainTransactionScope.DataProduct;
      const identifier = '0x00';
      const blocksAction = ActionButtonType.Buy;
      const transaction = jasmine.createSpy().and.returnValue(Promise.resolve(transactionHash));

      service.getTransactionReceipt = jasmine.createSpy().and.returnValue(Promise.reject(new Error(errorMessage)));
      service.addTransaction = jasmine.createSpy();
      service.removeTransaction = jasmine.createSpy();

      return new Promise(async resolve => {
        let counter = 0;
        subject.subscribe(transactionEvent => {
          if (counter === 1) {
            expect(transactionEvent.type).toBe(TransactionEventType.Created);
          } else if (counter === 2) {
            expect(transactionEvent.type).toBe(TransactionEventType.Confirmed);
          } else if (counter === 3) {
            expect(transactionEvent.type).toBe(TransactionEventType.Dropped);
            expect(transactionEvent.error.message).toBe(errorMessage);
            resolve();
          }

          counter++;
        });

        await service.handleTransaction(subject, scope, identifier, blocksAction, transaction);

        expect(service.getTransactionReceipt).toHaveBeenCalled();
        expect(service.addTransaction).toHaveBeenCalled();
        expect(service.removeTransaction).toHaveBeenCalled();
      });
    });
  });

  describe('#getTransactionReceipt()', () => {
    it('should return result of waitForTransactionResult', async () => {
      const expectedResult = { status: TransactionStatus };

      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        waitForTransactionResult() {
          return Promise.resolve(expectedResult);
        }
      });

      const result = await service.getTransactionReceipt('0x00');
      expect(result).toEqual(<any> expectedResult);
    });
  });

  describe('#removeTransaction()', () => {
    it('should remove transaction from currentTransactions', () => {
      const transaction = {
        transactionHash: '0x00',
        identifier: '0x01',
        scope: BlockchainTransactionScope.DataProduct,
        blocksAction: ActionButtonType.Buy
      } as Transaction;

      service.addTransaction(transaction);
      service.removeTransaction(transaction);

      expect(service[ 'currentTransactionsSubject' ].getValue()).toEqual([]);
    });
  });

  describe('#removeDroppedTransactions()', () => {
    it('should remove transaction from droppedTransactions', () => {
      const transaction = {
        transactionHash: '0x00',
        identifier: '0x01',
        scope: BlockchainTransactionScope.DataProduct,
        blocksAction: ActionButtonType.Buy
      } as Transaction;

      service[ 'addDroppedTransaction' ](transaction);
      service.removeDroppedTransactions(transaction.identifier);

      expect(service[ 'droppedTransactionsSubject' ].getValue()).toEqual([]);
    });
  });

  describe('#trackOrphanedTransaction()', () => {
    it('should call getTransactionReceipt for current transaction hash', async () => {
      const transaction = {
        transactionHash: '0x00',
        identifier: '0x01',
        scope: BlockchainTransactionScope.DataProduct,
        blocksAction: ActionButtonType.Buy
      } as Transaction;

      service.getTransactionReceipt = jasmine.createSpy().and.returnValue(Promise.resolve({ status: TransactionStatus.SUCCESSFUL }));
      service.removeTransaction = jasmine.createSpy();
      service[ 'addDroppedTransaction' ] = jasmine.createSpy();

      await service.trackOrphanedTransaction(transaction);

      expect(service[ 'addDroppedTransaction' ]).not.toHaveBeenCalled();
      expect(service.removeTransaction).toHaveBeenCalled();
    });

    it('should add transaction to droppedTransaction when getTransactionReceipt throws DroppedTransactionError', async () => {
      const transaction = {
        transactionHash: '0x00',
        identifier: '0x01',
        scope: BlockchainTransactionScope.DataProduct,
        blocksAction: ActionButtonType.Buy
      } as Transaction;

      service.getTransactionReceipt = jasmine.createSpy().and.returnValue(Promise.reject('Transaction dropped'));
      service.removeTransaction = jasmine.createSpy();
      service[ 'addDroppedTransaction' ] = jasmine.createSpy();

      await service.trackOrphanedTransaction(transaction);

      expect(service[ 'addDroppedTransaction' ]).toHaveBeenCalled();
      expect(service.removeTransaction).toHaveBeenCalled();
    });
  });
});
