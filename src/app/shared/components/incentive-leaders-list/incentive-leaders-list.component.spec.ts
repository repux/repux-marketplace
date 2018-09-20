import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '../../../material.module';
import { BlockyIdenticonComponent } from '../blocky-identicon/blocky-identicon.component';
import { IncentiveLeadersListComponent } from './incentive-leaders-list.component';

describe('IncentiveLeadersListComponent', () => {
  let component: IncentiveLeadersListComponent;
  let fixture: ComponentFixture<IncentiveLeadersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialModule
      ],
      declarations: [
        IncentiveLeadersListComponent,
        BlockyIdenticonComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncentiveLeadersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
