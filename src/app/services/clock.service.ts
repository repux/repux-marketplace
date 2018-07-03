import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClockService implements OnDestroy {
  private eachSecondInterval;
  private eachSecondSubject = new Subject<Date>();

  constructor() {
    this.eachSecondInterval = setInterval(() => {
      this.eachSecondSubject.next(new Date());
    }, 1000);
  }

  onEachSecond(): Observable<Date> {
    return this.eachSecondSubject.asObservable();
  }

  ngOnDestroy(): void {
    if (this.eachSecondInterval) {
      clearInterval(this.eachSecondInterval);
    }
  }
}
