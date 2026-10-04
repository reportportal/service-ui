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

import { useEffect } from 'react';
import { mount } from 'enzyme';
import { useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import {
  pipelineCatalogProjectKeySelector,
  pipelineCatalogVersionSelector,
  pipelineIterationDetailsSelector,
  pipelineIterationsByPipelineSelector,
} from 'controllers/aiFactory/pipelines';
import { projectKeySelector } from 'controllers/project';
import type { TestCase } from 'types/testCase';

import { useIterationNumber } from './useIterationNumber';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('controllers/aiFactory/pipelines', () => ({
  pipelineCatalogProjectKeySelector: jest.fn(),
  pipelineCatalogVersionSelector: jest.fn(),
  pipelineIterationDetailsSelector: jest.fn(),
  pipelineIterationsByPipelineSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('common/utils', () => {
  const actual = jest.requireActual<typeof import('common/utils')>('common/utils');

  return { ...actual, fetch: jest.fn() };
});

interface HarnessProps {
  iteration?: string;
  testCases?: TestCase[];
  canLoadMetadata?: boolean;
  onResult: (value?: number) => void;
}

const Harness = ({
  iteration,
  testCases = [],
  canLoadMetadata = false,
  onResult,
}: HarnessProps) => {
  const value = useIterationNumber(iteration, testCases, canLoadMetadata);

  useEffect(() => {
    onResult(value);
  }, [onResult, value]);

  return null;
};

const generatedCase = (iterationId: number, number?: number) =>
  ({
    id: 1,
    displayId: 'TC1',
    ai: {
      generatedByIteration: { pipelineId: 1, iterationId, number },
      modifiedByAgent: false,
      factoryKey: 'spec::case',
    },
  }) as TestCase;

interface SelectorState {
  projectKey: string;
  catalogProjectKey: string | null;
  catalogVersion: number;
  details: Record<string, unknown> | null;
  iterationsByPipeline: Record<number, Array<Record<string, unknown>>> | null;
}

describe('useIterationNumber validated cached metadata', () => {
  const state: SelectorState = {
    projectKey: 'demo',
    catalogProjectKey: 'demo',
    catalogVersion: 3,
    details: null,
    iterationsByPipeline: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(state, {
      projectKey: 'demo',
      catalogProjectKey: 'demo',
      catalogVersion: 3,
      details: null,
      iterationsByPipeline: null,
    });
    jest.mocked(useSelector).mockImplementation((selector) => {
      if (selector === projectKeySelector) return state.projectKey;
      if (selector === pipelineCatalogProjectKeySelector) return state.catalogProjectKey;
      if (selector === pipelineCatalogVersionSelector) return state.catalogVersion;
      if (selector === pipelineIterationDetailsSelector) return state.details;
      if (selector === pipelineIterationsByPipelineSelector) return state.iterationsByPipeline;
      return undefined;
    });
  });

  const renderResult = (iteration?: string, canLoadMetadata = true, testCases: TestCase[] = []) => {
    let result: number | undefined;
    const wrapper = mount(
      <Harness
        iteration={iteration}
        canLoadMetadata={canLoadMetadata}
        testCases={testCases}
        onResult={(value) => {
          result = value;
        }}
      />,
    );
    return { getResult: () => result, wrapper };
  };

  test('prefers the iteration number already attached to a loaded test case', () => {
    state.details = { id: 103, pipelineId: 7, number: 9 };
    const { getResult, wrapper } = renderResult('103', true, [generatedCase(103, 4)]);

    expect(getResult()).toBe(4);
    expect(fetch).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  test.each([
    ['the matching LP3 detail', { details: { id: 103, pipelineId: 7, number: 7 } }, 7],
    [
      'a matching LP2 summary',
      { iterationsByPipeline: { 7: [{ id: 103, pipelineId: 7, number: 8 }] } },
      8,
    ],
  ])(
    'uses %s from the same-project validated catalog cache',
    (_description, overrides, expected) => {
      Object.assign(state, overrides);

      const { getResult, wrapper } = renderResult('103');

      expect(getResult()).toBe(expected);
      expect(fetch).not.toHaveBeenCalled();
      wrapper.unmount();
    },
  );

  test.each([
    ['metadata loading is disabled', { canLoadMetadata: false }],
    ['the catalog is unresolved', { catalogVersion: 0 }],
    ['the catalog belongs to another project', { catalogProjectKey: 'other-project' }],
    ['the current project key is empty', { projectKey: '' }],
    ['the detail identity differs', { details: { id: 104, number: 7 } }],
    ['the cached number is not positive', { details: { id: 103, number: 0 } }],
    ['the cached number is fractional', { details: { id: 103, number: 1.5 } }],
    ['the cached number is not numeric', { details: { id: 103, number: '7' } }],
  ])('does not expose cached metadata when %s', (_description, overrides) => {
    state.details = { id: 103, pipelineId: 7, number: 7 };
    Object.assign(state, overrides);

    const canLoadMetadata =
      'canLoadMetadata' in overrides ? Boolean(overrides.canLoadMetadata) : true;
    const { getResult, wrapper } = renderResult('103', canLoadMetadata);

    expect(getResult()).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  test.each([undefined, '', '0', '-1', '1.5', '1e3', '9007199254740992', 'not-an-id'])(
    'does not perform a direct LP3 request for invalid iteration query %p',
    (iteration) => {
      state.details = { id: 103, pipelineId: 7, number: 7 };

      const { getResult, wrapper } = renderResult(iteration);

      expect(getResult()).toBeUndefined();
      expect(fetch).not.toHaveBeenCalled();
      wrapper.unmount();
    },
  );

  test('reacts to a newly cached same-project summary without issuing network traffic', () => {
    const results: Array<number | undefined> = [];
    const onResult = (value?: number) => results.push(value);
    const wrapper = mount(<Harness iteration="103" canLoadMetadata onResult={onResult} />);

    state.iterationsByPipeline = { 7: [{ id: 103, pipelineId: 7, number: 11 }] };
    wrapper.setProps({ iteration: '103', canLoadMetadata: true, onResult });

    expect(results.at(-1)).toBe(11);
    expect(fetch).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
