import { Injectable, OnDestroy } from '@angular/core';
import Wallet from '../shared/models/wallet';
import { RepuxWeb3Service } from './repux-web3.service';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import BigNumber from 'bignumber.js';

enum WorkerState {
  Ready,
  InProgress
}

export enum MetamaskStatus {
  WrongNetwork,
  NotInstalled,
  NotLoggedIn,
  Ok
}

@Injectable({
  providedIn: 'root'
})
export class WalletService implements OnDestroy {
  private metamaskStatus: MetamaskStatus;
  private rafReference: number;
  private metamaskStatusSubject = new BehaviorSubject<MetamaskStatus>(undefined);
  private walletSubject = new BehaviorSubject<Wallet>(undefined);
  private balanceSubject = new BehaviorSubject<BigNumber>(undefined);
  private currentFrame = 0;
  private checkFramesInterval = 100;
  private workerState: WorkerState;
  private currentAccount: string;

  constructor(private repuxWeb3Service: RepuxWeb3Service) {
    if (requestAnimationFrame) {
      this.rafReference = requestAnimationFrame(this.detectionWorker.bind(this));
    }
  }

  async detectionWorker() {
    this.rafReference = requestAnimationFrame(this.detectionWorker.bind(this));
    if (this.workerState === WorkerState.InProgress || this.currentFrame < this.checkFramesInterval) {
      this.currentFrame++;
      return;
    }

    this.workerState = WorkerState.InProgress;
    this.currentFrame = 0;

    const currentStatus = await this.detectMetamaskStatus();
    let currentAccount;

    const web3Service: RepuxWeb3Service = await this.repuxWeb3Service;
    const repuxApi = await web3Service.getRepuxApiInstance();

    if (repuxApi) {
      currentAccount = await repuxApi.getDefaultAccount();
    }

    if (currentStatus !== this.metamaskStatus) {
      this.metamaskStatus = currentStatus;
      this.metamaskStatusSubject.next(currentStatus);

      if (currentStatus === MetamaskStatus.Ok) {
        const wallet = await this.getWalletData();
        this.walletSubject.next(wallet);
        this.balanceSubject.next(wallet.balance);
      } else {
        this.walletSubject.next(null);
        this.balanceSubject.next(null);
      }
    }

    if (this.currentAccount !== currentAccount) {
      this.currentAccount = currentAccount;
      const wallet = await this.getWalletData();
      this.walletSubject.next(wallet);
      this.balanceSubject.next(wallet ? wallet.balance : null);
    }

    this.workerState = WorkerState.Ready;
  }

  async detectMetamaskStatus(): Promise<MetamaskStatus> {
    const web3Service = await this.repuxWeb3Service;

    if (!web3Service.isProviderAvailable()) {
      return MetamaskStatus.NotInstalled;
    }

    if (!(await web3Service.isNetworkCorrect())) {
      return MetamaskStatus.WrongNetwork;
    }

    if (!(await web3Service.isDefaultAccountAvailable())) {
      return MetamaskStatus.NotLoggedIn;
    }

    return MetamaskStatus.Ok;
  }

  getMetamaskStatus(): Observable<MetamaskStatus> {
    return this.metamaskStatusSubject.asObservable();
  }

  getWallet(): Observable<Wallet> {
    return this.walletSubject.asObservable();
  }

  getBalance(): Observable<BigNumber> {
    return this.balanceSubject.asObservable();
  }

  async getWalletData(): Promise<Wallet> {
    const web3Api = await this.getWeb3Api();
    if (!web3Api) {
      return;
    }

    const defaultAccount = await web3Api.getDefaultAccount();
    const accountBalance = await web3Api.getBalance();

    return new Wallet(defaultAccount, accountBalance);
  }

  async updateBalance(): Promise<void> {
    const web3Api = await this.getWeb3Api();
    if (!web3Api) {
      return;
    }

    const wallet = this.walletSubject.getValue();
    if (!wallet) {
      return;
    }

    const balance = await web3Api.getBalance();
    wallet.balance = balance;
    this.balanceSubject.next(balance);
  }

  ngOnDestroy(): void {
    if (this.rafReference) {
      cancelAnimationFrame(this.rafReference);
    }
  }

  private async getWeb3Api() {
    const web3Service = await this.repuxWeb3Service;
    if (!(await web3Service.isDefaultAccountAvailable())) {
      return;
    }

    return await web3Service.getRepuxApiInstance();
  }
}
