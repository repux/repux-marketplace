import { ArrayJoinPipe } from './array-join.pipe';

describe('ArrayJoinPipe', () => {
  describe('#transform()', () => {
    it('return array joined by separator provided as argument', () => {
      const pipe = new ArrayJoinPipe();
      expect(pipe.transform(['first elem', 2, 'third elem'], '|')).toBe('first elem|2|third elem');
      expect(pipe.transform(['first elem', 2], ', ')).toBe('first elem, 2');
    });
  });
});
