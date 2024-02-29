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

import { queueReducers } from './queueReducers';

describe('queueReducers', () => {
  test('Should each provided function with provided arguments', () => {
    const fn1 = jest.fn().mockImplementation((argument) => argument);
    const fn2 = jest.fn().mockImplementation((argument) => argument);
    const fn3 = jest.fn().mockImplementation((argument) => argument);

    const state = { value: 'value' };
    const action = { action: 'action' };

    queueReducers(fn1, fn2, fn3)(state, action);

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn3).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledWith(state, action);
    expect(fn2).toHaveBeenCalledWith(state, action);
    expect(fn3).toHaveBeenCalledWith(state, action);
  });
});
