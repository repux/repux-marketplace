import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IncentiveComponent } from './incentive.component';
import { MaterialModule } from '../../../material.module';
import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

@Component({ selector: 'app-incentive-leaders-list', template: '' })
class IncentiveLeadersListStubComponent {
  @Input() items: any[];
  @Input() title: string;
  @Input() columns: string[];
}

describe('IncentiveComponent', () => {
  let component: IncentiveComponent;
  let fixture: ComponentFixture<IncentiveComponent>;

  const httpClientSpy = jasmine.createSpyObj('HttpClient', [ 'post' ]);
  httpClientSpy.post.and.returnValue(of({ aggregations: { group_by_file: { buckets: [] } } }));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule
      ],
      declarations: [
        IncentiveComponent,
        IncentiveLeadersListStubComponent
      ],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy }
      ]
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
