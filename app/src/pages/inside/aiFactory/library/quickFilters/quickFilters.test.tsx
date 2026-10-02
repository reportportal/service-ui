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

import { shallow } from 'enzyme';
import { SegmentedControl } from '@reportportal/ui-kit';

import { Lifecycle } from 'types/aiFactory';

import { QuickFilters, QuickFiltersProps } from './quickFilters';

jest.mock('@reportportal/ui-kit', () => ({
  CloseIcon: 'CloseIcon',
  SegmentedControl: 'SegmentedControl',
}));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage?: string; id?: string },
      values?: Record<string, number>,
    ) =>
      Object.entries(values ?? {}).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, String(value)),
        message.defaultMessage ?? message.id ?? '',
      ),
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: unknown[]) =>
      classNames
        .filter((className): className is string => typeof className === 'string' && !!className)
        .join(' '),
}));

interface TestWrapper {
  at: (index: number) => TestWrapper;
  children: () => TestWrapper;
  dive: () => TestWrapper;
  find: (selector: unknown) => TestWrapper;
  prop: (key: string) => unknown;
  simulate: (event: string) => void;
  text: () => string;
  length: number;
}

const renderFilters = (props: QuickFiltersProps): TestWrapper =>
  shallow(<QuickFilters {...props} />) as unknown as TestWrapper;

const getControl = (wrapper: TestWrapper, index: number) =>
  wrapper.children().at(index).dive().find(SegmentedControl);

describe('QuickFilters', () => {
  test('renders lifecycle and AI states with the current selections', () => {
    const wrapper = renderFilters({
      lifecycle: Lifecycle.READY,
      ai: 'NO_AI',
      onChange: jest.fn(),
    });
    const lifecycleOptions = getControl(wrapper, 0).prop('options');
    const aiOptions = getControl(wrapper, 1).prop('options');

    expect(lifecycleOptions).toEqual([
      { label: 'All', value: 'ALL', selected: false },
      { label: 'Draft', value: Lifecycle.DRAFT, selected: false },
      { label: 'Ready', value: Lifecycle.READY, selected: true },
    ]);
    expect(aiOptions).toEqual([
      { label: 'All', value: 'ALL', selected: false },
      { label: 'AI', value: 'AI', selected: false },
      { label: 'No AI', value: 'NO_AI', selected: true },
    ]);
  });

  test.each([
    [0, Lifecycle.DRAFT, { lifecycle: Lifecycle.DRAFT }],
    [0, Lifecycle.READY, { lifecycle: Lifecycle.READY }],
    [0, 'ALL', { lifecycle: undefined }],
    [1, 'AI', { ai: 'AI' }],
    [1, 'NO_AI', { ai: 'NO_AI' }],
    [1, 'ALL', { ai: undefined }],
  ])('reports a partial filter change from control %i for %s', (index, value, expected) => {
    const onChange = jest.fn();
    const wrapper = renderFilters({ onChange });

    const changeControl = getControl(wrapper, index).prop('onChange') as (
      nextValue: string | number,
    ) => void;
    changeControl(value);

    expect(onChange).toHaveBeenCalledWith(expected);
  });

  test('activates Review queue and changes only lifecycle and AI so iteration is preserved', () => {
    const onChange = jest.fn();
    const wrapper = renderFilters({
      lifecycle: Lifecycle.DRAFT,
      ai: 'AI',
      iteration: '103',
      reviewQueueCount: 4,
      onChange,
    });
    const reviewQueue = wrapper.children().at(2).dive().find('button');

    expect(reviewQueue.prop('aria-pressed')).toBe(true);
    expect(reviewQueue.text()).toContain('Review queue');
    expect(reviewQueue.text()).toContain('4');

    reviewQueue.simulate('click');

    expect(onChange).toHaveBeenCalledWith({ lifecycle: Lifecycle.DRAFT, ai: 'AI' });
  });

  test('renders the iteration number and removes only the iteration filter', () => {
    const onChange = jest.fn();
    const wrapper = renderFilters({ iteration: '103', iterationNumber: 4, onChange });

    const iterationChip = wrapper.children().at(3).dive();

    expect(iterationChip.text()).toContain('Iteration #4');

    iterationChip.find('button').simulate('click');

    expect(onChange).toHaveBeenCalledWith({ iteration: undefined });
  });

  test('uses a truthful generic chip label while the iteration number is unresolved', () => {
    const wrapper = renderFilters({ iteration: '103', onChange: jest.fn() });
    const iterationChip = wrapper.children().at(3).dive();

    expect(iterationChip.text()).toContain('Iteration');
    expect(iterationChip.text()).not.toContain('#103');
  });

  test('Clear removes only the three AI filter keys', () => {
    const onChange = jest.fn();
    const wrapper = renderFilters({
      lifecycle: Lifecycle.READY,
      ai: 'AI',
      iteration: '103',
      onChange,
    });

    wrapper.find('[data-automation-id="clearAiFactoryFilters"]').simulate('click');

    expect(onChange).toHaveBeenCalledWith({
      lifecycle: undefined,
      ai: undefined,
      iteration: undefined,
    });
  });

  test('hides iteration and Clear controls when no filter is active', () => {
    const wrapper = renderFilters({ onChange: jest.fn() });

    expect(wrapper.find('[data-automation-id="removeIterationFilter"]')).toHaveLength(0);
    expect(wrapper.find('[data-automation-id="clearAiFactoryFilters"]')).toHaveLength(0);
  });
});
