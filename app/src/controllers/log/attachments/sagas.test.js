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

import { fetch } from 'common/utils/fetch';
import { fetchImageData, fetchData } from './sagas';

jest.mock('common/utils/fetch', () => ({
  fetch: jest.fn(),
}));

const mockParams = {
  projectId: 'test_project',
  binaryId: 'abcd',
};

describe('Attachments Sagas', () => {
  test('fetchImageData resolves image', () => {
    expect.assertions(1);
    fetchImageData(mockParams);
    expect(fetch).toBeCalledWith('/api/v1/data/test_project/abcd', { responseType: 'blob' });
  });

  test('fetchData resolves data', () => {
    fetchData(mockParams);
    expect(fetch).toBeCalledWith('/api/v1/data/test_project/abcd');
  });
});
