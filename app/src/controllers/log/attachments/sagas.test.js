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
import { fetchFileData, openImageModalsWorker } from './sagas';

jest.mock('common/utils/fetch', () => ({
  fetch: jest.fn(),
}));

const mockParams = {
  projectKey: 'test_project',
  id: 'abcd',
};

describe('Attachments Sagas', () => {
  test('fetchFileData resolves data', () => {
    const params = { responseType: 'blob' };
    fetchFileData(mockParams, params);
    expect(fetch).toHaveBeenCalledWith('../api/v1/data/test_project/abcd', params);
  });
});

describe('openImageModalsWorker', () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:image');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  test('revokes the image URL when another attachment cancels the worker', () => {
    const gen = openImageModalsWorker({ ...mockParams, fileName: 'a.png' });
    gen.next(); // fetch
    gen.next(new Blob(['x'])); // show modal
    gen.next(); // reset loading id
    gen.next(); // wait for HIDE_MODAL
    gen.return(); // takeLatest cancels the worker

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image');
  });
});
