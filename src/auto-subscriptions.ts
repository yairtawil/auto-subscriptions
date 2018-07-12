export type AutoSubscriptionsInput = string | ((...args) => any);
export type AutoSubscriptionsDataInput = [string, ((...args) => any) | undefined];

export interface AutoSubscriptionsMetaData {
    init: AutoSubscriptionsInput;
    destroy: AutoSubscriptionsInput;
}

function _getDataViaInput(prototype: any, input: AutoSubscriptionsInput): AutoSubscriptionsDataInput | never {
    switch (typeof input) {
        case 'string': {
            return [<string> input, prototype[<string> input]];
        }
        case 'function':
            return Object.entries<(...args) => any>(prototype).find(([key, value]: [string, any]) => value === input);

        default:
            new Error('Invalid input')
    }
}

export function AutoSubscriptions({ init, destroy }: AutoSubscriptionsMetaData): any | never {
    return function (constructor) {
        const [initKey, originalInit] = _getDataViaInput(constructor.prototype, init);
        if (!initKey) {
            new Error('Illegal \"init\" input!');
        }

        const [destroyKey, originalDestroy] = _getDataViaInput(constructor.prototype, destroy);
        if (!destroyKey) {
            new Error('Illegal \"destroy\" input!');
        }

        constructor.prototype[initKey] = function (...args) {
            if (this._subscriptionsPropertyKeys_) {
                this._subscriptionsList_ =
                    this._subscriptionsPropertyKeys_
                        .map((key) => this[key])
                        .filter(Boolean)
                        .map((value) => typeof value === 'function' ? value() : value)
                        .filter((observable: { subscribe: any }) => typeof observable.subscribe === 'function')
                        .map((observable) => observable.subscribe());
            }
            if (originalInit) {
                return originalInit.bind(this)(...args);
            }
        };

        constructor.prototype[destroyKey] = function (...args) {
            this._subscriptionsList_
                .filter((subscription: { unsubscribe: any }) => typeof subscription.unsubscribe === 'function')
                .forEach((subscription: { unsubscribe: any }) => subscription.unsubscribe());

            if (originalDestroy) {
                return originalDestroy.bind(this)(...args);
            }
        };
    };
}

export function AutoSubscription(target: any, propertyKey: string | symbol) {
    target._subscriptionsPropertyKeys_ = [...(target._subscriptionsPropertyKeys_ || []), propertyKey];
}
