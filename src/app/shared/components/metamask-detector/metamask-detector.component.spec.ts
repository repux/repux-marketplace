import { async } from '@angular/core/testing';
import { MetamaskDetectorComponent } from './metamask-detector.component';

describe('MetamaskDetectorComponent', () => {
  let component: MetamaskDetectorComponent;
  let walletServiceSpy: any;

  beforeEach(async(() => {
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getMetamaskStatus' ]);
    component = new MetamaskDetectorComponent(walletServiceSpy);
  }));

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
