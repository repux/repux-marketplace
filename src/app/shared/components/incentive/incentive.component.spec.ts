import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveComponent } from './incentive.component';
import { MaterialModule } from '../../../material.module';

describe('IncentiveComponent', () => {
  let component: IncentiveComponent;
  let fixture: ComponentFixture<IncentiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule
      ],
      declarations: [ IncentiveComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncentiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
