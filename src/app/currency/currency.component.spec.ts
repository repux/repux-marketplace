import { CurrencyComponent } from './currency.component';
import { BigNumber } from 'bignumber.js';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrencyComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#displayedValue()', () => {
    it('should change displayedValue properly when component parameters changes', () => {
      expect(component.displayedValue).toBe('0');
      component.value = new BigNumber('199.112');
      expect(component.displayedValue).toBe('199.112');
      component.precision = 1;
      expect(component.displayedValue).toBe('199.1');
      component.precision = 18;
      component.value = new BigNumber('199.55555555555555555555555555555');
      expect(component.displayedValue).toBe('199.555555555555555556');
      component.precision = 0;
      expect(component.displayedValue).toBe('200');
    });
  });

  describe('#DOM', () => {
    it('should contain displayedValue with currency', () => {
      const currencyElement: HTMLElement = fixture.nativeElement;

      component.value = new BigNumber('199.112');
      fixture.detectChanges();
      let span = currencyElement.querySelector('span');
      expect(span.textContent).toEqual(' REPUX');
      expect(currencyElement.textContent).toEqual('199.112 REPUX');

      component.nameBeforeValue = true;
      fixture.detectChanges();
      expect(currencyElement.textContent).toEqual('REPUX 199.112');
      span = currencyElement.querySelector('span');
      expect(span.textContent).toEqual('REPUX ');

      component.currencyName = 'some currency';
      fixture.detectChanges();
      span = currencyElement.querySelector('span');
      expect(span.textContent).toEqual('some currency ');
    });
  });
});
