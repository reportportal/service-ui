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

import { shallow, type ShallowWrapper } from 'enzyme';

import type { PipelinePageState } from 'controllers/aiFactory/pipelines';

import { PageControls } from './pageControls';

jest.mock('@reportportal/ui-kit', () => ({ Button: 'Button' }));
jest.mock('react-intl', () =>
  jest.requireActual<typeof import('../../aiFactoryTestUtils')>(
    'pages/inside/aiFactory/aiFactoryTestUtils',
  ).reactIntlTestMock,
);
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: string[]) => classNames.join(' '),
}));

const page: PipelinePageState = {
  number: 2, size: 100, totalElements: 250, totalPages: 3, offset: 100,
};

const buttonAt = (wrapper: ShallowWrapper, index: number) =>
  (wrapper.find('Button') as unknown as {
    at: (position: number) => { prop: (name: string) => unknown };
  }).at(index);

describe('PageControls', () => {
  test('navigates by the backend page size and disables boundaries', () => {
    const onPageChange = jest.fn();
    const wrapper = shallow(<PageControls page={page} isLoading={false} onPageChange={onPageChange} />);
    (buttonAt(wrapper, 0).prop('onClick') as () => void)();
    (buttonAt(wrapper, 1).prop('onClick') as () => void)();
    expect(onPageChange.mock.calls).toEqual([[0], [200]]);
    expect(wrapper.text()).toContain('Page 2 of 3');

    const first = shallow(<PageControls page={{ ...page, number: 1, offset: 0 }}
      isLoading={false} onPageChange={onPageChange} />);
    expect(buttonAt(first, 0).prop('disabled')).toBe(true);
    const last = shallow(<PageControls page={{ ...page, number: 3, offset: 200 }}
      isLoading={false} onPageChange={onPageChange} />);
    expect(buttonAt(last, 1).prop('disabled')).toBe(true);
  });
});
