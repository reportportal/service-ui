import * as utils from 'common/utils';
import { call, select } from 'redux-saga/effects';
import { tokenSelector } from 'controllers/auth';

import { fetchImageData, fetchData } from './sagas';

jest.mock('common/utils', () => ({
  fetchAPI: jest.fn(),
}));

const mockParams = {
  projectId: 1234,
  binaryId: 'abcd',
};

describe('Attachments Sagas', () => {
  test('fetchImageData resolves image', () => {
    const expected = {
      image: '/api/v1/1234/data/abcd',
    };
    expect.assertions(1);
    return expect(fetchImageData(mockParams)).resolves.toEqual(expected);
  });

  test('fetchData resolves data', () => {
    const gen = fetchData(mockParams);

    expect(gen.next().value).toEqual(select(tokenSelector));
    expect(gen.next('mock_token').value).toEqual(
      call(utils.fetchAPI, '/api/v1/1234/data/abcd', 'mock_token'),
    );
    expect(gen.next().done).toEqual(true);
  });
});
