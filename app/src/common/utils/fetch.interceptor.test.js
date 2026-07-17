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

  test('marks API available on successful api info response with valid API service', async () => {
    axiosMock.onGet('/api/info').reply(200, {
      build: { name: 'API Service' },
    });

    await axios.get('/api/info');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: false,
      },
    });
  });

  test('marks API unavailable when build.name is missing', async () => {
    axiosMock.onGet('/api/info').reply(200, { build: {} });

    await axios.get('/api/info');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable when build.name is not "API Service"', async () => {
    axiosMock.onGet('/api/info').reply(200, {
      build: { name: 'Unknown Service' },
    });

    await axios.get('/api/info');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable when build is missing', async () => {
    axiosMock.onGet('/api/info').reply(200, {});

    await axios.get('/api/info');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('does not mark availability for ui info responses', async () => {
    axiosMock.onGet('/ui/info').reply(200, {
      build: { name: 'Service UI' },
    });

    await axios.get('/ui/info');

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('marks API unavailable on api info gateway error', async () => {
    axiosMock.onGet('/api/info').reply(503);

    await expect(axios.get('/api/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on api info internal server error', async () => {
    axiosMock.onGet('/api/info').reply(500);

    await expect(axios.get('/api/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on api info request timeout', async () => {
    axiosMock.onGet('/api/info').reply(408);

    await expect(axios.get('/api/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on api info rate limiting', async () => {
    axiosMock.onGet('/api/info').reply(429);

    await expect(axios.get('/api/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on api info bad gateway error', async () => {
    axiosMock.onGet('/api/info').reply(502);

    await expect(axios.get('/api/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on api info gateway timeout', async () => {
    axiosMock.onGet('/api/info').reply(504);

    await expect(axios.get('/api/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });

  test('marks API unavailable on api info network error', async () => {
    axiosMock.onGet('/api/info').networkError();

    await expect(axios.get('/api/info')).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'setServiceAvailability',
      payload: {
        checked: true,
        apiUnavailable: true,
      },
    });
  });
});
