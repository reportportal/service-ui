/*
 * Copyright 2019 EPAM Systems
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
import { abortPendingRequests, fetch, ERROR_CANCELED, ERROR_UNAUTHORIZED } from './fetch';

const axiosMock = new MockAdapter(axios);

describe('fetch', () => {
  beforeAll(() => {
    axiosMock
      .onGet('https://api.com/success')
      .reply((config) => [200, { requestHeaders: config.headers }]);
    axiosMock.onGet('https://api.com/timeout').reply(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([200, 'hello']), 10);
        }),
    );
    axiosMock.onGet('https://api.com/unauthorized').reply(401);
    axiosMock.onGet('https://api.com/error-object').reply(400, { errorCode: 4001, message: 'Bad' });
    axiosMock
      .onGet('https://api.com/error-html')
      .reply(502, '<html><body>Bad Gateway</body></html>');
    axiosMock.onGet('https://api.com/error-text').reply(400, 'Plain failure');
    axiosMock.onGet('https://api.com/error-blob').reply(
      404,
      new Blob([JSON.stringify({ errorCode: 4041, message: 'Not found' })], {
        type: 'application/json',
      }),
    );
  });

  it('should be cancelable', (done) => {
    jest.useFakeTimers();
    let cancelRequest;
    const cancelFuncCallback = (cancel) => {
      cancelRequest = cancel;
    };
    setTimeout(() => cancelRequest(), 0);
    fetch('https://api.com/timeout', { abort: cancelFuncCallback }).catch((err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe(ERROR_CANCELED);
      done();
    });
    jest.runAllTimers();
  }, 20);

  it('aborts requests without their own signal when pending requests are aborted', async () => {
    jest.useRealTimers();
    const pending = fetch('https://api.com/timeout');
    abortPendingRequests();

    await expect(pending).rejects.toThrow(ERROR_CANCELED);
    // the next request gets a fresh controller
    await expect(fetch('https://api.com/success')).resolves.toBeDefined();
  });

  it('aborts requests with their own cancel callback when pending requests are aborted', async () => {
    const pending = fetch('https://api.com/timeout', { abort: () => {} });
    abortPendingRequests();

    await expect(pending).rejects.toThrow(ERROR_CANCELED);
  });

  it('aborts requests with their own signal when pending requests are aborted', async () => {
    const own = new AbortController();
    const pending = fetch('https://api.com/timeout', { signal: own.signal });
    abortPendingRequests();

    await expect(pending).rejects.toThrow(ERROR_CANCELED);
  });

  it('still aborts a request through its own signal', async () => {
    const own = new AbortController();
    const pending = fetch('https://api.com/timeout', { signal: own.signal });
    own.abort();

    await expect(pending).rejects.toThrow(ERROR_CANCELED);
  });

  it('keeps requests marked to outlive the session', async () => {
    const pending = fetch('https://api.com/timeout', { keepOnLogout: true });
    abortPendingRequests();

    await expect(pending).resolves.toBe('hello');
  });

  it('should return authorization error on 401 response code', (done) => {
    fetch('https://api.com/unauthorized').catch((err) => {
      expect(err.message).toBe(ERROR_UNAUTHORIZED);
      done();
    });
  });

  it('should keep object error bodies as is', async () => {
    await expect(fetch('https://api.com/error-object')).rejects.toEqual({
      errorCode: 4001,
      message: 'Bad',
    });
  });

  it('should not expose HTML error bodies as the message', async () => {
    await expect(fetch('https://api.com/error-html')).rejects.toEqual({
      message: 'Request failed with status code 502',
      status: 502,
    });
  });

  it('should wrap plain text error bodies into an object', async () => {
    await expect(fetch('https://api.com/error-text')).rejects.toEqual({
      message: 'Plain failure',
      status: 400,
    });
  });

  it('should parse JSON error bodies of blob requests', async () => {
    await expect(fetch('https://api.com/error-blob', { responseType: 'blob' })).rejects.toEqual({
      errorCode: 4041,
      message: 'Not found',
    });
  });
});
