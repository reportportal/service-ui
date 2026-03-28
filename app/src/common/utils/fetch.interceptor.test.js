/*
 * Copyright 2026 EPAM Systems
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

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { initAuthInterceptor } from './fetch';

const axiosMock = new MockAdapter(axios);

const clearResponseInterceptors = () => {
  if (typeof axios.interceptors.response.clear === 'function') {
    axios.interceptors.response.clear();
  }
};

describe('initAuthInterceptor', () => {
  let store;

  beforeEach(() => {
    clearResponseInterceptors();
    axiosMock.reset();
    store = {
      dispatch: jest.fn(),
      getState: () => ({ auth: { token: null } }),
    };
    initAuthInterceptor(store);
  });

  afterAll(() => {
    clearResponseInterceptors();
  });

  test('marks API available on successful composite info response', async () => {
    axiosMock.onGet('/composite/info').reply(200, { api: false, uat: true });

    await axios.get('/composite/info');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: false,
      },
    });
  });

  test('ignores composite payload for availability flags', async () => {
    axiosMock.onGet('/composite/info').reply(200, { api: true });

    await axios.get('/composite/info');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: false,
      },
    });
  });

  test('marks API unavailable on composite info gateway error', async () => {
    axiosMock.onGet('/composite/info').reply(503);

    await expect(axios.get('/composite/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on composite info internal server error', async () => {
    axiosMock.onGet('/composite/info').reply(500);

    await expect(axios.get('/composite/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on composite info request timeout', async () => {
    axiosMock.onGet('/composite/info').reply(408);

    await expect(axios.get('/composite/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on composite info rate limiting', async () => {
    axiosMock.onGet('/composite/info').reply(429);

    await expect(axios.get('/composite/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

});
