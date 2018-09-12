import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs';

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;

@Injectable({
  providedIn: 'root'
})
export class ClockService implements OnDestroy {
  private second = 1;
  private eachSecondInterval;
  private eachSecondSubject = new Subject<Date>();
  private eachMinuteSubject = new Subject<Date>();
  private eachHourSubject = new Subject<Date>();

  constructor() {
    this.eachSecondInterval = setInterval(() => {
      this.eachSecondSubject.next(new Date());

      if (this.second % MINUTE_IN_SECONDS === 0) {
        this.eachMinuteSubject.next(new Date());
      }

      if (this.second % HOUR_IN_SECONDS === 0) {
        this.eachHourSubject.next(new Date());
        this.second = 0;
      }

      this.second++;
    }, 1000);
  }

  onEachSecond(): Observable<Date> {
    return this.eachSecondSubject.asObservable();
  }

  onEachMinute(): Observable<Date> {
    return this.eachMinuteSubject.asObservable();
  }

  onEachHour(): Observable<Date> {
    return this.eachHourSubject.asObservable();
  }

  ngOnDestroy(): void {
    if (this.eachSecondInterval) {
      clearInterval(this.eachSecondInterval);
    }
  }
}
