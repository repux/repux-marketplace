import { ClockService } from './clock.service';

describe('ClockService', () => {
  let service;
  const SECOND = 1000;
  const TOLERANCE = 10;

  beforeEach(() => {
    service = new ClockService();
  });

  describe('#onEachSecond()', () => {
    it('should return observable firing each second', async () => {
      await new Promise(resolve => {
        let previousDate;
        const subscription = service.onEachSecond().subscribe(date => {
          if (!previousDate) {
            previousDate = date;
            return;
          }

          const timeDifference = date.getTime() - previousDate.getTime();

          expect(timeDifference).toBeGreaterThan(SECOND - TOLERANCE);
          expect(timeDifference).toBeLessThan(SECOND + TOLERANCE);
          subscription.unsubscribe();
          resolve();
        });
      });
    });
  });
});
