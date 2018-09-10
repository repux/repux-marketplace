import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerTestnetComponent } from './banner-testnet.component';

describe('BannerTestnetComponent', () => {
  let component: BannerTestnetComponent;
  let fixture: ComponentFixture<BannerTestnetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BannerTestnetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerTestnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
