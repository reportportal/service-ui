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

import { act, useEffect } from 'react';
import { mount } from 'enzyme';
import { useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { ERROR_CANCELED, fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import type { TestCase } from 'types/testCase';

import { useIterationNumber } from './useIterationNumber';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
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

const deferred = <T,>() => {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
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

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe('useIterationNumber direct LP3 lookup', () => {
  const fetchMock = fetch as unknown as jest.Mock;
  let projectKey = 'demo';

  beforeEach(() => {
    jest.clearAllMocks();
    projectKey = 'demo';
    jest.mocked(useSelector).mockImplementation((selector) => {
      if (selector === projectKeySelector) return projectKey;
      return undefined;
    });
  });

  test('uses loaded case data without requesting LP3 metadata', () => {
    let result: number | undefined;

    mount(
      <Harness
        iteration="103"
        testCases={[generatedCase(103, 4)]}
        canLoadMetadata
        onResult={(value) => {
          result = value;
        }}
      />,
    );

    expect(result).toBe(4);
    expect(fetch).not.toHaveBeenCalled();
  });

  test.each([
    ['metadata loading is disabled', '103', false, 'demo'],
    ['the project key is empty', '103', true, ''],
    ['the iteration is empty', undefined, true, 'demo'],
    ['the iteration is zero', '0', true, 'demo'],
    ['the iteration is negative', '-1', true, 'demo'],
    ['the iteration is fractional', '1.5', true, 'demo'],
    ['the iteration is exponential notation', '1e3', true, 'demo'],
    ['the iteration exceeds safe integer range', '9007199254740992', true, 'demo'],
  ])(
    'returns unresolved without a request when %s',
    (_description, iteration, canLoadMetadata, nextProjectKey) => {
      let result: number | undefined = 99;
      projectKey = nextProjectKey;

      mount(
        <Harness
          iteration={iteration}
          canLoadMetadata={canLoadMetadata}
          onResult={(value) => {
            result = value;
          }}
        />,
      );

      expect(result).toBeUndefined();
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  test('loads the exact project-scoped LP3 URL and exposes only the validated number', async () => {
    const cancel = jest.fn();
    let result: number | undefined;
    fetchMock.mockImplementationOnce(
      (_url: string, options: { abort?: (cancelRequest: () => void) => void }) => {
        options.abort?.(cancel);
        return Promise.resolve({ id: 103, iterationNumber: 7 });
      },
    );

    const wrapper = mount(
      <Harness
        iteration="103"
        canLoadMetadata
        onResult={(value) => {
          result = value;
        }}
      />,
    );

    expect(result).toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      URLS.pipelineIterationById('demo', 103),
      expect.objectContaining({ abort: expect.any(Function) }),
    );
    expect(jest.mocked(fetch).mock.calls[0][0]).toBe(
      '../api/v1/project/demo/pipeline/iteration/103',
    );

    await flushPromises();
    expect(result).toBe(7);

    wrapper.unmount();
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['a mismatched id', { id: 104, iterationNumber: 7 }],
    ['a string id', { id: '103', iterationNumber: 7 }],
    ['a missing id', { iterationNumber: 7 }],
    ['a zero number', { id: 103, iterationNumber: 0 }],
    ['a negative number', { id: 103, iterationNumber: -1 }],
    ['a fractional number', { id: 103, iterationNumber: 1.5 }],
    ['a string number', { id: 103, iterationNumber: '7' }],
    ['an unsafe number', { id: 103, iterationNumber: 9007199254740992 }],
  ])('keeps the number unresolved for %s', async (_description, response) => {
    let result: number | undefined;
    fetchMock.mockResolvedValueOnce(response);

    mount(
      <Harness
        iteration="103"
        canLoadMetadata
        onResult={(value) => {
          result = value;
        }}
      />,
    );
    await flushPromises();

    expect(result).toBeUndefined();
  });

  test.each([
    ['a failed request', () => Promise.reject(new Error('network failed'))],
    ['a canceled request', () => Promise.reject(new Error(ERROR_CANCELED))],
  ])('keeps the number unresolved after %s', async (_description, createResponse) => {
    let result: number | undefined;
    fetchMock.mockImplementationOnce(() => createResponse());

    mount(
      <Harness
        iteration="103"
        canLoadMetadata
        onResult={(value) => {
          result = value;
        }}
      />,
    );
    await flushPromises();

    expect(result).toBeUndefined();
  });

  test('ignores an aborted stale-project response that resolves after the new project', async () => {
    const first = deferred<{ id: number; iterationNumber: number }>();
    const second = deferred<{ id: number; iterationNumber: number }>();
    const cancelFirst = jest.fn();
    const results: (number | undefined)[] = [];
    const onResult = (value?: number) => {
      results.push(value);
    };
    fetchMock
      .mockImplementationOnce(
        (_url: string, options: { abort?: (cancelRequest: () => void) => void }) => {
          options.abort?.(cancelFirst);
          return first.promise;
        },
      )
      .mockReturnValueOnce(second.promise);
    const wrapper = mount(
      <Harness iteration="103" canLoadMetadata onResult={onResult} />,
    );

    projectKey = 'other-project';
    wrapper.setProps({ iteration: '103', canLoadMetadata: true, onResult });

    expect(cancelFirst).toHaveBeenCalledTimes(1);
    expect(jest.mocked(fetch).mock.calls[1][0]).toBe(
      '../api/v1/project/other-project/pipeline/iteration/103',
    );

    await act(async () => {
      second.resolve({ id: 103, iterationNumber: 8 });
      await second.promise;
    });
    expect(results.at(-1)).toBe(8);

    await act(async () => {
      first.resolve({ id: 103, iterationNumber: 7 });
      await first.promise;
    });
    expect(results.at(-1)).toBe(8);
  });

  test('ignores an aborted stale-iteration response that resolves last', async () => {
    const first = deferred<{ id: number; iterationNumber: number }>();
    const second = deferred<{ id: number; iterationNumber: number }>();
    const results: (number | undefined)[] = [];
    const onResult = (value?: number) => {
      results.push(value);
    };
    fetchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const wrapper = mount(
      <Harness iteration="103" canLoadMetadata onResult={onResult} />,
    );

    wrapper.setProps({ iteration: '104', canLoadMetadata: true, onResult });

    await act(async () => {
      second.resolve({ id: 104, iterationNumber: 9 });
      await second.promise;
    });
    expect(results.at(-1)).toBe(9);

    await act(async () => {
      first.resolve({ id: 103, iterationNumber: 7 });
      await first.promise;
    });
    expect(results.at(-1)).toBe(9);
  });
});
