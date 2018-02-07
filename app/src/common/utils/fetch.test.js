import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { DEFAULT_TOKEN } from 'controllers/auth';
import { fetch, ERROR_CANCELED, ERROR_UNAUTHORIZED } from './fetch';

const axiosMock = new MockAdapter(axios);

const MOCK_TOKEN = 'mock token';

describe('fetch', () => {
  beforeAll(() => {
    axiosMock.onGet('https://api.com/success').reply(config => [200, { requestHeaders: config.headers }]);
    axiosMock.onGet('https://api.com/timeout').reply(() => (
      new Promise((resolve) => {
        setTimeout(() => resolve([200, 'hello']), 10);
      })
    ));
    axiosMock.onGet('https://api.com/unauthorized').reply(401);
  });

  it('should send default token in case of no auth', (done) => {
    fetch('https://api.com/success')
      .then((res) => {
        expect(res.requestHeaders.Authorization).toEqual(DEFAULT_TOKEN);
        done();
      });
  });

  it('should send correct token after auth', (done) => {
    localStorage.setItem('token', MOCK_TOKEN);
    fetch('https://api.com/success')
      .then((res) => {
        expect(res.requestHeaders.Authorization).toEqual(MOCK_TOKEN);
        done();
      });
  });

  it('should be cancelable', (done) => {
    let cancelRequest;
    const cancelFuncCallback = (cancel) => {
      cancelRequest = cancel;
    };
    setTimeout(() => cancelRequest(), 5);
    fetch('https://api.com/timeout', { abort: cancelFuncCallback })
      .catch((err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(ERROR_CANCELED);
        done();
      });
  }, 20);

  it('should return authorization error on 401 response code', (done) => {
    fetch('https://api.com/unauthorized').catch((err) => {
      expect(err.message).toBe(ERROR_UNAUTHORIZED);
      done();
    });
  });
});
