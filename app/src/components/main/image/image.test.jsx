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

import { act } from 'react';
import { mount } from 'enzyme';
import { fetch } from 'common/utils/fetch';
import { Image } from './image';
import { clearImageCache } from './imageBlobCache';

jest.mock('common/utils/fetch', () => ({
  ...jest.requireActual('common/utils/fetch'),
  fetch: jest.fn(),
}));

const SRC = '/api/v1/project/data/thumbnail-1';

const mountImage = async (props = {}) => {
  let wrapper;
  await act(async () => {
    wrapper = mount(<Image src={SRC} {...props} />);
  });
  wrapper.update();
  return wrapper;
};

describe('Image', () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => 'blob:image');
    URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    clearImageCache();
    fetch.mockReset();
    fetch.mockResolvedValue(new Blob(['image'], { type: 'image/png' }));
  });

  test('shows a cached image mounted again without requesting it again', async () => {
    (await mountImage({ cached: true })).unmount();

    const wrapper = await mountImage({ cached: true });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(wrapper.find('img').prop('src')).toBe('blob:image');
  });

  test('requests the image on every mount without the cache', async () => {
    (await mountImage()).unmount();

    await mountImage();

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('shows a cached lazy image without waiting for it to become visible', async () => {
    (await mountImage({ cached: true })).unmount();

    const wrapper = await mountImage({ cached: true, lazy: true });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(wrapper.find('img').exists()).toBe(true);
  });
});
