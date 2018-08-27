import { MaterialModule } from '../../material.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import BigNumber from 'bignumber.js';
import { MarketplaceRatingComponent } from './marketplace-rating.component';

describe('MarketplaceRatingComponent', () => {
  let component: MarketplaceRatingComponent;
  let fixture: ComponentFixture<MarketplaceRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceRatingComponent
      ],
      imports: [
        MaterialModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceRatingComponent);
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

  describe('#get percentageRating()', () => {
    it('should calculate percentage rating properly', () => {
      component.maxRate = 5;
      component.rating = new BigNumber(5);
      expect(component.percentageRating).toEqual(100);

      component.rating = new BigNumber(0);
      expect(component.percentageRating).toEqual(0);

      component.rating = new BigNumber(3);
      expect(component.percentageRating).toEqual(60);

      component.maxRate = 6;
      expect(component.percentageRating).toEqual(50);
    });
  });

  describe('#get ratingSnapshot()', () => {
    it('should return all ratings from orders', () => {
      component.orders = <any> [ {
        rating: new BigNumber(3)
      }, {
        rating: null
      }, {
        rating: new BigNumber(3)
      }, {
        rating: new BigNumber(5)
      } ];

      expect(component.ratingSnapshot).toEqual([ 0, 0, 2, 0, 1 ]);
    });
  });

  describe('#get ratingSnapshotTotal()', () => {
    it('should return number of rates', () => {
      component.orders = <any> [ {
        rating: new BigNumber(3)
      }, {
        rating: null
      }, {
        rating: new BigNumber(3)
      }, {
        rating: new BigNumber(5)
      } ];

      expect(component.ratingSnapshotTotal).toBe(3);
    });
  });
});

