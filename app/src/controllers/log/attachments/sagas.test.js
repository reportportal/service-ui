import * as utils from 'common/utils';
import { fetchImageData, fetchData } from './sagas';

jest.mock('common/utils', () => ({
  fetch: jest.fn(),
}));

const mockParams = {
  binaryId: 'abcd',
};

describe('Attachments Sagas', () => {
  test('fetchImageData resolves image', () => {
    expect.assertions(1);
    fetchImageData(mockParams);
    expect(utils.fetch).toBeCalledWith('/api/v1/data/abcd', { responseType: 'blob' });
  });

  test('fetchData resolves data', () => {
    fetchData(mockParams);
    expect(utils.fetch).toBeCalledWith('/api/v1/data/abcd');
  });
});
