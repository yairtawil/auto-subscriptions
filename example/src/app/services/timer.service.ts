import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions/auto-subscriptions';

@Injectable({
  providedIn: 'root'
})
@AutoSubscriptions({
  init: 'onStart',
  destroy: 'onStop'
})
export class TimerService {
  millisec = 0;
  sec = 0;
  isOn: boolean;
  history = [];

  @AutoSubscription
  timer$ = interval(10)
    .pipe(
      tap((num) => {
        this.millisec = num;
        this.sec = parseInt( (`${this.millisec / 100}`));
      })
    );

  onStart() {
    this.isOn = true;
    console.log('Start timer')
  }

  onStop() {
    this.isOn = false;
    this.history = [...this.history, { date: new Date(), time: `${this.sec} : ${this.millisec}` }];
    this.millisec = this.sec = 0;
    console.log('Stop timer')
  }

  toggle() {
    if(!this.isOn) {
      this.onStart();
    } else {
      this.onStop();
    }
  }

  clear() {
    this.history = [];
  }

}
