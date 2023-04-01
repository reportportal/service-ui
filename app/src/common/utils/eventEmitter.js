export class EventEmitter {
  constructor() {
    this.subscribers = {};
  }

  listenersCount(eventName) {
    return (this.subscribers[eventName] || []).length;
  }

  emit(eventName, ...rest) {
    const handlers = this.subscribers[eventName] || [];
    handlers.forEach((handler) => handler(...rest));
    return this;
  }

  on(eventName, handler) {
    if (typeof handler === 'function') {
      const handlers = this.subscribers[eventName] || [];
      this.subscribers[eventName] = [...handlers, handler];
    }
    return this;
  }

  removeListeners(eventName, handler) {
    if (typeof handler === 'function') {
      const handlers = this.subscribers[eventName] || [];

      this.subscribers[eventName] = handlers.filter((subscriber) => subscriber !== handler);
    }
    return this;
  }
}
