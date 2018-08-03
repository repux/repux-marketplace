import { MarketplaceRateOrderDialogComponent } from './marketplace-rate-order-dialog.component';
import { MaterialModule } from '../../material.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import BigNumber from 'bignumber.js';

describe('MarketplaceRateOrderDialog', () => {
  let component: MarketplaceRateOrderDialogComponent;
  let fixture: ComponentFixture<MarketplaceRateOrderDialogComponent>;
  let matDialogRefSpy;

  beforeEach(async () => {
    matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', [ 'close' ]);

    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceRateOrderDialogComponent
      ],
      imports: [
        MaterialModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceRateOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#get availableRates()', () => {
    it('should return array of available rates from minRate to maxRate', () => {
      component.minRate = 1;
      component.maxRate = 5;

      expect(component.availableRates).toEqual([ 1, 2, 3, 4, 5 ]);

      component.minRate = 3;
      component.maxRate = 6;

      expect(component.availableRates).toEqual([ 3, 4, 5, 6 ]);
    });
  });

  describe('#setRating', () => {
    it('should set rating value when rate is lte maxRate and gte minValue', () => {
      expect(component.rating).toEqual(new BigNumber(0));

      component.setRating(5);
      expect(component.rating).toEqual(new BigNumber(5));

      component.setRating(6);
      expect(component.rating).toEqual(new BigNumber(5));

      component.setRating(0);
      expect(component.rating).toEqual(new BigNumber(5));
    });
  });

  describe('#closeWithSuccess()', () => {
    it('should call matDialogRef.close with rating as a argument', () => {
      const rating = new BigNumber(3);
      component.rating = rating;

      component.closeWithSuccess();

      expect(matDialogRefSpy.close.calls.count()).toBe(1);
      expect(matDialogRefSpy.close.calls.allArgs()[ 0 ]).toEqual([ rating ]);
    });
  });
});
