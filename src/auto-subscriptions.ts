export type AutoSubscriptionsInput = string | ((...args) => any);
export type AutoSubscriptionsDataInput = [string, ((...args) => any) | undefined];

export type InputKeys = 'init' | 'destroy';
export type AutoSubscriptionsMetaData = { [K in InputKeys]: AutoSubscriptionsInput; }

export enum Errors {
    invalidType = '"{{key}}" input must be of type "string" or "function"',
    invalidFunction = 'could not found {{key}} function on prototype'
}

interface Subscription {
    unsubscribe();
}

const isSubscription = (subscription: Subscription)  => typeof subscription.unsubscribe === 'function';

interface Observable {
    subscribe();
}

const isObservable = (observable: Observable)  => typeof observable.subscribe === 'function';

export interface AutoSubscriptionProps {
    readonly _subscriptionsPropertyKeys_: string[];
    _subscriptionsList_: Subscription[];
}

function _getDataViaInput(prototype: any, key: InputKeys, input: AutoSubscriptionsInput): AutoSubscriptionsDataInput | never {
    switch (typeof input) {
        case 'string': {
            return [<string> input, prototype[<string> input]];
        }
        case 'function':
            const result = Object.entries<(...args) => any>(prototype).find(([key, value]: [string, any]) => value === input);
            if (result) {
                return result
            } else {
                throw new Error(Errors.invalidFunction.replace('{{key}}', key));
            }

        default:
            throw new Error(Errors.invalidType.replace('{{key}}', key));
    }
}

export const initSubscriptions = (instance: AutoSubscriptionProps): void => {
    instance._subscriptionsList_ =
        instance._subscriptionsPropertyKeys_
            .map((key) => instance[key])
            .filter(Boolean)
            .map((value) => typeof value === 'function' ? value() : value)
            .filter(isObservable)
            .map((observable: Observable) => observable.subscribe());

};

export const removeSubscriptions = (instance: AutoSubscriptionProps): void => {
    instance._subscriptionsList_
        .filter(isSubscription)
        .forEach((subscription: Subscription) => subscription.unsubscribe());
    instance._subscriptionsList_ = [];
};

const AutoAutoSubscriptionsInit = (originalInit) => {
    return function (...args) {
        if (Array.isArray(this._subscriptionsPropertyKeys_)) {
            initSubscriptions(this);
        }
        if (originalInit) {
            return originalInit.bind(this)(...args);
        }
    };
};

const AutoAutoSubscriptionsDestory = (originalDestroy) => {
    return function (...args) {
        if (Array.isArray(this._subscriptionsList_)) {
            removeSubscriptions(this)
        }
        if (originalDestroy) {
            return originalDestroy.bind(this)(...args);
        }
    };
};

export function AutoSubscriptions({ init, destroy }: AutoSubscriptionsMetaData): any | never {
    return function (constructor) {
        const [initKey, originalInit] = _getDataViaInput(constructor.prototype, 'init', init);
        const [destroyKey, originalDestroy] = _getDataViaInput(constructor.prototype, 'destroy', destroy);
        constructor.prototype[initKey] = AutoAutoSubscriptionsInit(originalInit);
        constructor.prototype[destroyKey] = AutoAutoSubscriptionsDestory(originalDestroy)
    };
}

export function AutoSubscription(target: any, propertyKey: string | symbol) {
    target._subscriptionsPropertyKeys_ = [...(target._subscriptionsPropertyKeys_ || []), propertyKey];
}
