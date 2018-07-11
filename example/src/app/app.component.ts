import { Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions/auto-subscriptions';
import { TimerService } from './services/timer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@AutoSubscriptions({
  init: 'ngOnInit',
  destroy: 'ngOnDestroy'
})
export class AppComponent implements OnInit {
  mouseUp = 0;
  click = 0;

  @AutoSubscription
  onClick$ = fromEvent(window, 'click')
    .pipe(
      tap(($event: MouseEvent) => this.click++)
    );

  @AutoSubscription
  mouseUp$ = fromEvent(window, 'mouseup')
    .pipe(
      tap(($event: MouseEvent) => this.mouseUp = this.mouseUp+1)
    );

  displayedColumns: string[] = ['date', 'time'];

  constructor(public timer: TimerService) {
  }

  toggleTimer() {
    this.timer.toggle();
  }

  clearHistroy() {
    this.timer.clear();
  }

  ngOnInit() {
    console.log('ngOnInit 👍 👍 👍 ');
  }

}
