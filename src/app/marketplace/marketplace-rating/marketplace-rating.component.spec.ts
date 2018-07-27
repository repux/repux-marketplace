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
});

