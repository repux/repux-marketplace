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

