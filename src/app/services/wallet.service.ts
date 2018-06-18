import { Injectable, OnDestroy } from '@angular/core';
import Wallet from '../wallet';
import { RepuxWeb3Service } from './repux-web3.service';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

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
  private metamaskStatus = MetamaskStatus.Ok;
  private rafReference: number;
  private metamaskStatusSubject = new BehaviorSubject<MetamaskStatus>(MetamaskStatus.Ok);
  private walletSubject = new BehaviorSubject<Wallet>(undefined);
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
    const currentAccount = await this.repuxWeb3Service.getRepuxApiInstance().getDefaultAccount();

    if (currentStatus !== this.metamaskStatus) {
      this.metamaskStatus = currentStatus;
      this.metamaskStatusSubject.next(currentStatus);

      if (currentStatus === MetamaskStatus.Ok) {
        const wallet = await this.getWalletData();
        this.walletSubject.next(wallet);
      } else {
        this.walletSubject.next(null);
      }
    }

    if (this.currentAccount !== currentAccount) {
      this.currentAccount = currentAccount;
      const wallet = await this.getWalletData();
      this.walletSubject.next(wallet);
    }

    this.workerState = WorkerState.Ready;
  }

  async detectMetamaskStatus(): Promise<MetamaskStatus> {
    if (!this.repuxWeb3Service.isProviderAvailable()) {
      return MetamaskStatus.NotInstalled;
    }

    if (!(await this.repuxWeb3Service.isNetworkCorrect())) {
      return MetamaskStatus.WrongNetwork;
    }

    if (!(await this.repuxWeb3Service.isDefaultAccountAvailable())) {
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

  async getWalletData(): Promise<Wallet> {
    if (!(await this.repuxWeb3Service.isDefaultAccountAvailable())) {
      return;
    }

    const defaultAccount = await this.repuxWeb3Service.getRepuxApiInstance().getDefaultAccount();
    const accountBalanceInWei = await this.repuxWeb3Service.getRepuxApiInstance().getBalance();
    const accountBalanceInEther = this.repuxWeb3Service.getWeb3Instance().fromWei(accountBalanceInWei, 'ether');

    return new Wallet(defaultAccount, +accountBalanceInEther.toString());
  }

  ngOnDestroy(): void {
    if (this.rafReference) {
      cancelAnimationFrame(this.rafReference);
    }
  }
}
