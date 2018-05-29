import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskManagerComponent } from './task-manager.component';
import {
  MatDialogModule,
  MatDialogRef,
  MatIconModule,
  MatProgressSpinnerModule,
  MatToolbarModule
} from '@angular/material';
import { ChangeDetectorRef } from '@angular/core';

describe('TaskManagerComponent', () => {
  let matDialogRef, changeDetectorRef, taskManagerService;
  let component: TaskManagerComponent;
  let fixture: ComponentFixture<TaskManagerComponent>;

  beforeEach(async(() => {
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'closeDialog' ]);
    matDialogRef = jasmine.createSpyObj('MatDialogObj', [ 'updatePosition' ]);
    changeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', [ 'markForCheck', 'detectChanges' ]);

    TestBed.configureTestingModule({
      declarations: [ TaskManagerComponent ],
      imports: [
        MatIconModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRef },
        { provide: ChangeDetectorRef, useValue: changeDetectorRef }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#onNgInit()', () => {
    it('should create and call matDialogRef.updatePosition', () => {
      expect(component).toBeTruthy();
      expect(matDialogRef.updatePosition.calls.count()).toBe(1);
      expect(matDialogRef.updatePosition.calls.allArgs()[ 0 ][ 0 ]).toEqual({
        right: '15px',
        bottom: '15px'
      });
    });
  });

  describe('#ngOnChanges()', () => {
    it('should assign to lastStatus values from taskManagerService.tasks', () => {
      expect(component[ '_lastStatus' ]).toEqual([]);
      component[ '_taskManagerService' ] = <any> {
        tasks: [ {
          status: 'STATUS',
          finished: false,
          errors: [],
          progress: 15
        } ]
      };
      component.ngOnChanges();
      expect(component[ '_lastStatus' ].length).toBe(1);
      expect(component[ '_lastStatus' ][ 0 ].status).toBe('STATUS');
      expect(component[ '_lastStatus' ][ 0 ].finished).toBeFalsy();
      expect(component[ '_lastStatus' ][ 0 ].errors).toEqual([]);
      expect(component[ '_lastStatus' ][ 0 ].progress).toBe(15);

      component[ '_taskManagerService' ].tasks[ 0 ].progress = 12;
      component.ngOnChanges();
      expect(component[ '_lastStatus' ][ 0 ].progress).toBe(12);
    });
  });
});
