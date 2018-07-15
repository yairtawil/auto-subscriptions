[![NPM](https://nodei.co/npm/auto-subscriptions.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/auto-subscriptions/)

**[Demo](https://yairtawil.github.io/auto-subscriptions/)**

# Auto Subscriptions

Typescript library for automagically handling `subscribe()` / `unsubscribe()` of Observable properties of classes.

## Installation

```shell
npm install auto-subscriptions
```

## Usage

Add `@AutoSubscriptions` to the class and `@AutoSubscription` to the class observable properties, for which you want automatic subscription handling:

```typescript
import { AutoSubscriptions } from 'auto-subscriptions';

@AutoSubscriptions({
  init: 'init',
  destroy: 'destroy'
})
export class MyClass {
  @AutoSubscription
  myObs$: Observable<boolean> = of(true);

  @AutoSubscription
  myObsD$: Observable<boolean> = of(false);
  
  init() {
  }
  destroy() {
  }
}
```
Another way:

```typescript
import { AutoSubscriptions } from 'auto-subscriptions';
import { Observable, of } from 'rxjs';

@AutoSubscriptions({
  init: MyClassB.prototype.init,
  destroy: MyClassB.prototype.destroy
})
export class MyClassB {
  @AutoSubscription
  myObs$: Observable<boolean> = of(true);

  @AutoSubscription
  myObsD$: Observable<boolean> = of(false);
  
  init() {
  }
  destroy() {
  }
}
```
 when `init` is called `subscribe()` will be invoked for all `@AutoSubscription` observable properies,

when `destroy` is called `unsubscribe()` will be invoked for all `@AutoSubscription` observable properies,

For example:

```typescript
  const myClass = new MyClass();
  myClass.init() /* subscribe() is invoked for all @AutoSubscription observable properies, */
  
  // code ...
  
  myClass.destroy() /* unsubscribe() is invoked for all @AutoSubscription observable properies */
  
```

Angular components:

```typescript
import { Component } from '@angular/core';
import { AutoSubscriptions } from 'auto-subscriptions';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
@AutoSubscriptions({
  init: 'ngOnInit',
  destroy: 'ngOnDestroy'
})
export class AppComponent {
  result: Object;
  
  @AutoSubscription
  httpOnInit$: Observable<Object> = this.http.get('HTTP_URL').pipe(
    tap((result: Object) => this.result = result)
  );
  
  constructor(protected http: HttpClient) {
  }
  
}

```

