import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceAnalyticsDialogComponent } from './marketplace-analytics-dialog.component';
import { KeysPasswordDialogComponent } from '../../key-store/keys-password-dialog/keys-password-dialog.component';
import { MaterialModule } from '../../material.module';
import { MatDialogRef } from '@angular/material';

describe('MarketplaceAnalyticsDialogComponent', () => {
  let component: MarketplaceAnalyticsDialogComponent;
  let fixture: ComponentFixture<MarketplaceAnalyticsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceAnalyticsDialogComponent
      ],
      imports: [
        MaterialModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceAnalyticsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
