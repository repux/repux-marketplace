import { CurrencyRepuxPipe } from './currency-repux.pipe';

describe('CurrencyRepux', () => {
  describe('#transform()', () => {
    it('return properly formatted strings', () => {
      const pipe = new CurrencyRepuxPipe();
      expect(pipe.transform('10.0000000000000000015')).toBe('REPUX 10.000000000000000002');
      expect(pipe.transform('10.000000000000000001')).toBe('REPUX 10.000000000000000001');
      expect(pipe.transform('10.000000000000000000')).toBe('REPUX 10.00');
      expect(pipe.transform('10')).toBe('REPUX 10.00');
      expect(pipe.transform('100000000.111111111111111111')).toBe('REPUX 100,000,000.111111111111111111');
      expect(pipe.transform('10', '')).toBe(' 10.00');
      expect(pipe.transform('10.000006', 'REPUX', 5)).toBe('REPUX 10.00001');
      expect(pipe.transform('10.000000000100000000')).toBe('REPUX 10.0000000001');
      expect(pipe.transform('10.111111111111111111', 'REPUX', 5, true)).toBe('REPUX 10.11111...');
    });
  });
});
