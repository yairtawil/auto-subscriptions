export interface AutoSubscriptionsMetaData {
    init: string;
    destroy: string;
}

export function AutoSubscriptions({ init, destroy }: AutoSubscriptionsMetaData) {
    return function (constructor) {
        const OnInit = constructor.prototype[init];
        const OnDestroy = constructor.prototype[destroy];

        constructor.prototype[init] = function () {
            if (this._subscriptionsPropertyKeys_) {
                this._subscriptionsList_ =
                    this._subscriptionsPropertyKeys_
                        .map((key) => this[key])
                        .filter(Boolean)
                        .map((value) => typeof value === 'function' ? value() : value)
                        .filter((observable: { subscribe: any }) => typeof observable.subscribe === 'function')
                        .map((observable) => observable.subscribe());
            }

            if (OnInit) {
                return OnInit.bind(this)();
            }
        };

        constructor.prototype[destroy] = function () {
            this._subscriptionsList_
                .filter((subscription: { unsubscribe: any }) => typeof subscription.unsubscribe === 'function')
                .forEach((subscription: { unsubscribe: any }) => subscription.unsubscribe());
            if (OnDestroy) {
                return OnDestroy.bind(this)();
            }
        };
    };
}

export function AutoSubscription(target: any, propertyKey: string | symbol) {
    target._subscriptionsPropertyKeys_ = [...(target._subscriptionsPropertyKeys_ || []), propertyKey];
}
