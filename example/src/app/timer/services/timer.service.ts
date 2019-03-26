import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

@Injectable({
  providedIn: 'root'
})
@AutoSubscriptions({
  init: 'onStart',
  destroy: 'onStop'
})
export class TimerService {
  millisec = '0000';
  sec = '00';
  isOn: boolean;
  history = [];

  @AutoSubscription
  timer$ = interval(10)
    .pipe(
      tap(() => {
        const num = Number(this.millisec) + 1;
        this.millisec = `${num}`.padStart(4, '0');
        this.sec = `${parseInt((`${num / 100}`))}`.padStart(2, '0');
      })
    );

  onStart() {
    this.isOn = true;
  }

  onStop() {
    this.isOn = false;
    this.reset();
  }

  reset() {
    this.history = [...this.history, { date: new Date(), time: `${this.sec} : ${this.millisec}` }];
    this.millisec = '0000';
    this.sec = '00';
  }

  toggle() {
    if (!this.isOn) {
      this.onStart();
    } else {
      this.onStop();
    }
  }

  clear() {
    this.history = [];
  }

}
