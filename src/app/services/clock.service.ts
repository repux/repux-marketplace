import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs';

const HOUR_IN_SECONDS = 3600;

@Injectable({
  providedIn: 'root'
})
export class ClockService implements OnDestroy {
  private second: number;
  private eachSecondInterval;
  private eachSecondSubject = new Subject<Date>();
  private eachHourSubject = new Subject<Date>();

  constructor() {
    this.eachSecondInterval = setInterval(() => {
      this.eachSecondSubject.next(new Date());

      if (this.second % HOUR_IN_SECONDS) {
        this.eachHourSubject.next(new Date());
      }

      this.second++;
    }, 1000);
  }

  onEachSecond(): Observable<Date> {
    return this.eachSecondSubject.asObservable();
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
