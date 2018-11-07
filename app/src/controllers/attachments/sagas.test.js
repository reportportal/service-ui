import * as utils from 'common/utils';

import { fetchImageData, fetchData } from './sagas';

jest.mock('common/utils', () => ({
  fetch: jest.fn(),
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
    fetchData(mockParams);
    expect(utils.fetch).toBeCalledWith('/api/v1/1234/data/abcd');
  });
});
