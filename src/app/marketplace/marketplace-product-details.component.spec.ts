import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceProductDetailsComponent } from './marketplace-product-details.component';
import { MaterialModule } from '../material.module';
import { CurrencyRepuxPipe } from '../shared/pipes/currency-repux';
import { FileSizePipe } from '../shared/pipes/file-size.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { EulaType } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { MarketplaceRatingComponent } from './marketplace-rating/marketplace-rating.component';
import { EulaTypePipe } from '../shared/pipes/eula-type.pipe';

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: string[];
}

describe('MarketplaceProductDetailsComponent', () => {
  let component: MarketplaceProductDetailsComponent;
  let fixture: ComponentFixture<MarketplaceProductDetailsComponent>;
  let ipfsServiceSpy;

  beforeEach(async(() => {
    ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'downloadAndSave' ]);

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceActionButtonsStubComponent,
        FileSizePipe,
        CurrencyRepuxPipe,
        EulaTypePipe,
        MarketplaceProductDetailsComponent,
        MarketplaceRatingComponent
      ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MaterialModule
      ],
      providers: [
        { provide: IpfsService, useValue: ipfsServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#downloadEula()', () => {
    it('should call ipfsService.downloadAndSave() method', async () => {
      const event = jasmine.createSpyObj('MouseEvent', [ 'stopPropagation' ]);
      const eula = {
        type: EulaType.OWNER,
        fileHash: 'FILE_HASH',
        fileName: 'FILE_NAME'
      };

      await component.downloadEula(event, eula);

      expect(event.stopPropagation.calls.count()).toBe(1);
      expect(ipfsServiceSpy.downloadAndSave.calls.allArgs()[ 0 ][ 0 ]).toBe(eula.fileHash);
      expect(ipfsServiceSpy.downloadAndSave.calls.allArgs()[ 0 ][ 1 ]).toBe(eula.fileName);
    });
  });

  describe('#downloadSampleFile()', () => {
    it('should call ipfsService.downloadAndSave() method', async () => {
      const event = jasmine.createSpyObj('MouseEvent', [ 'stopPropagation' ]);
      const file = {
        fileHash: 'FILE_HASH',
        fileName: 'FILE_NAME',
        title: 'TITLE'
      };

      await component.downloadSampleFile(event, file);

      expect(event.stopPropagation.calls.count()).toBe(1);
      expect(ipfsServiceSpy.downloadAndSave.calls.allArgs()[ 0 ][ 0 ]).toBe(file.fileHash);
      expect(ipfsServiceSpy.downloadAndSave.calls.allArgs()[ 0 ][ 1 ]).toBe(file.fileName);
    });
  });
});
