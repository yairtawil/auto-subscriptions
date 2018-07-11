import { Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
import { AutoSubscriptions, UnAutoSubscriptions } from 'auto-subscriptions/auto-subscriptions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@AutoSubscriptions
export class AppComponent implements OnInit {

  @UnAutoSubscriptions
  onClick$ = fromEvent(window, 'click')
    .pipe(
      tap(($event: MouseEvent) => console.log('click', $event))
    );

  mouseUp$ = fromEvent(window, 'mouseup')
    .pipe(
      tap(($event: MouseEvent) => console.log('mouseup', $event))
    );

  ngOnInit() {
  }
}
