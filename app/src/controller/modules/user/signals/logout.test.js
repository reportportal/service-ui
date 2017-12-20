import { runSignal } from 'cerebral/test';
import { httpAbort, httpDelete } from '@cerebral/http/operators';
import logout from './logout';

jest.mock('../../../globalActions');
jest.mock('@cerebral/http/operators', () => ({
  httpGet: jest.fn(),
  httpAbort: jest.fn(),
  httpDelete: jest.fn(),
}));

it('must discard all requests and send a request for logout', () => {
  runSignal(logout);

  expect(httpAbort.mock.calls.length).toBe(1);
  expect(httpDelete.mock.calls.length).toBe(1);
});
