import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { PriceInputComponent } from './price-input.component';
import BigNumber from 'bignumber.js';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PriceInputComponent', () => {
  let component: PriceInputComponent;
  let fixture: ComponentFixture<PriceInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PriceInputComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PriceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#ngOnChanges()', () => {
    it('it should update internal values when value is set', () => {
      const value = '111';
      component.value = new BigNumber(value);

      component.ngOnChanges();

      expect(component.formControl.value).toBe(value);
    });

    it('it should update internal values when formControl.value is set', () => {
      const value = '111';
      component.formControl.setValue(value);

      component.ngOnChanges();

      expect(component.value).toEqual(new BigNumber(value));
    });

    it('it should set value to undefined when it isn\'t provided', () => {
      component.ngOnChanges();

      expect(component.value).toBe(undefined);
      expect(component.formControl.value).toBe(undefined);
    });
  });

  describe('#onChange()', () => {
    it('should set value on formControl when value is defined', () => {
      const value = '1.111';
      component.onChange();
      expect(component.formControl.value).toBeFalsy();

      component.value = new BigNumber(value);
      component.onChange();
      expect(component.formControl.value).toBe(value);
    });
  });

  describe('#onInput()', () => {
    it('should set value to undefined when input value is empty', () => {
      component.value = new BigNumber(1);

      component.onInput({ target: { value: '' } });

      expect(component.value).toBe(undefined);
    });

    it('should set previous value to formControl.value when value not matches pattern', () => {
      component.value = new BigNumber(1);

      component.onInput({ target: { value: '3.3.3' } });

      expect(component.formControl.value).toBe('1');
    });

    it('should set value to formControl.value when value matches pattern', () => {
      component.value = new BigNumber(1);

      component.onInput({ target: { value: '3.3' } });

      expect(component.formControl.value).toBe('3.3');
    });
  });
});
