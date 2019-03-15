import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetch, ERROR_CANCELED, ERROR_UNAUTHORIZED } from './fetch';

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
  });

  it(
    'should be cancelable',
    (done) => {
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
    },
    20,
  );

  it('should return authorization error on 401 response code', (done) => {
    fetch('https://api.com/unauthorized').catch((err) => {
      expect(err.message).toBe(ERROR_UNAUTHORIZED);
      done();
    });
  });
});
