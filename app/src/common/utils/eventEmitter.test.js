/*
 * Copyright 2023 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EventEmitter } from './eventEmitter';

describe('EventEmitter', () => {
  const eventEmitter = new EventEmitter();
  const sayHi = () => 'Hello!';
  const sayBye = () => 'Bye!';
  const eventName = 'phrase';
  const mockSayHi = jest.fn(sayHi);

  afterEach(() => {
    eventEmitter.removeListeners(eventName, sayBye);
    eventEmitter.removeListeners(eventName, sayHi);
    eventEmitter.removeListeners(eventName, mockSayHi);
  });

  it('listenersCount() should return registered handlers count', () => {
    eventEmitter.on(eventName, sayHi);
    eventEmitter.on(eventName, sayBye);

    expect(eventEmitter.listenersCount(eventName)).toBe(2);
  });

  it('emit() should invoke all registered handlers', () => {
    eventEmitter.on(eventName, mockSayHi);
    eventEmitter.emit(eventName);
    eventEmitter.emit(eventName);
    expect(mockSayHi.mock.calls).toHaveLength(2);
  });

  it('removeListeners() should remove only passed handlers', () => {
    eventEmitter.on(eventName, sayHi);
    eventEmitter.on(eventName, sayHi);
    eventEmitter.on(eventName, sayBye);

    eventEmitter.removeListeners(eventName, sayHi);

    expect(eventEmitter.listenersCount(eventName)).toBe(1);
  });
});
