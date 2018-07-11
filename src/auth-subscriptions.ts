import { Observable } from 'rxjs';

export function AutoSubscriptions(constructor) {
    const ngOnInit = constructor.prototype.ngOnInit;
    const ngOnDestroy = constructor.prototype.ngOnDestroy;

    constructor.prototype.ngOnInit = function () {
        this._subscriptions_ = Object
            .entries(this)
            .filter(([key, value]: [string, any]) => !(constructor.prototype._subscriptionsBlackList_ || []).includes(key) && value instanceof Observable)
            .map(([key, value]: [string, Observable<any>]) => value)
            .map((value: Observable<any>) => value.subscribe());

        if (ngOnInit) {
            ngOnInit.bind(this)();
        }
    };

    constructor.prototype.ngOnDestroy = function () {
        this._subscriptions_.forEach((subscriber) => subscriber.unsubscribe());
        if (ngOnDestroy) {
            ngOnDestroy.bind(this)();
        }
    };


}

export function UnAutoSubscriptions(target: any, propertyKey: string | symbol) {
    if (!target._subscriptionsBlackList_) {
        target._subscriptionsBlackList_ = [];
    }
    target._subscriptionsBlackList_.push(propertyKey);

}
