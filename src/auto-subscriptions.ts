export type InputKeys = 'init' | 'destroy';

interface Subscription {
  unsubscribe();
}

const isSubscription = (subscription: Subscription) => typeof subscription.unsubscribe === 'function';

interface Observable {
  subscribe();
}

const isObservable = (observable: Observable) => typeof observable.subscribe === 'function';

export interface AutoSubscriptionProps {
  readonly AutoSubscriptionsPropertyKeys: string[];
  AutoSubscriptionsList: Subscription[];
}

export const initSubscriptions = (instance: AutoSubscriptionProps): void => {
  instance.AutoSubscriptionsList =
    instance.AutoSubscriptionsPropertyKeys
      .map((key) => instance[key])
      .filter(Boolean)
      .map((value) => typeof value === 'function' ? value() : value)
      .filter(isObservable)
      .map((observable: Observable) => observable.subscribe());

};

export const removeSubscriptions = (instance: AutoSubscriptionProps): void => {
  instance.AutoSubscriptionsList
    .filter(isSubscription)
    .forEach((subscription: Subscription) => subscription.unsubscribe());
  instance.AutoSubscriptionsList = [];
};

const AutoAutoSubscriptionsInit = (originalInit) => {
  return function(...args) {
    if (Array.isArray(this.AutoSubscriptionsPropertyKeys)) {
      initSubscriptions(this);
    }
    if (originalInit) {
      return originalInit.bind(this)(...args);
    }
  };
};

const AutoAutoSubscriptionsDestory = (originalDestroy) => {
  return function(...args) {
    if (Array.isArray(this.AutoSubscriptionsList)) {
      removeSubscriptions(this);
    }
    if (originalDestroy) {
      return originalDestroy.bind(this)(...args);
    }
  };
};

export function AutoSubscriptions<VALUE extends string>(metadata: { [KEY in InputKeys]: VALUE }) {
  return <PROTO extends new(...args) => { [K in VALUE]: (...args) => any }>
  (constructor: PROTO): void | never  => {
    const originalInit = constructor.prototype[metadata.init];
    const originalDestroy = constructor.prototype[metadata.destroy];
    if (!originalInit) {
      throw new Error(`Can\'t find init function with: ${metadata.init}`);
    }
    if (!originalDestroy) {
      throw new Error(`Can't find destroy function with ${metadata.destroy}`);
    }
    constructor.prototype[metadata.init] = AutoAutoSubscriptionsInit(originalInit);
    constructor.prototype[metadata.destroy] = AutoAutoSubscriptionsDestory(originalDestroy);
  };
}

export function AutoSubscription(target: any, propertyKey: string | symbol) {
  target.AutoSubscriptionsPropertyKeys = [...(target.AutoSubscriptionsPropertyKeys || []), propertyKey];
}
