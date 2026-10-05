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
import { useSelector } from 'react-redux';

import {
  PROJECT_PIPELINE_ITERATION_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';

import { ReducedIterationCard } from './reducedIterationCard';

jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('common/utils/timeDateUtils', () => ({
  formatDuration: (value: number) => `${value} ms`,
}));
jest.mock('controllers/pages', () => ({
  PROJECT_PIPELINE_ITERATION_PAGE: 'PROJECT_PIPELINE_ITERATION_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));

describe('ReducedIterationCard', () => {
  beforeEach(() => {
    jest
      .mocked(useSelector)
      .mockImplementation((selector) =>
        selector === urlOrganizationAndProjectSelector
          ? { organizationSlug: 'org', projectSlug: 'project' }
          : undefined,
      );
  });

  test('links a reduced iteration card to its generic detail route with exact identities', () => {
    const wrapper = shallow(
      <ReducedIterationCard
        iteration={{
          kind: 'reduced',
          id: 103,
          pipelineId: 7,
          number: 3,
          status: 'PASSED',
          trigger: 'CI',
          durationMs: 60_000,
          attributes: [],
          stages: [{ key: 'prepare', label: 'Prepare', sequence: 1, status: 'PASSED' }],
        }}
      />,
    );

    expect(wrapper.find('Link').prop('to')).toEqual({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug: 'org',
        projectSlug: 'project',
        pipelineId: 7,
        iterationId: 103,
      },
    });
    expect(wrapper.find('Link').prop('aria-label')).toBe('Iteration #3');
    expect(wrapper.text()).toContain('Iteration #3');
    expect(wrapper.text()).toContain('Passed');
    expect(wrapper.text()).toContain('CI');
    expect(wrapper.text()).toContain('60000 ms');
    expect(wrapper.text()).toContain('Prepare · Passed');
  });
});
