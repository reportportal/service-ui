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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { Lifecycle } from 'types/aiFactory';

import { useReviewQueueCount } from './useReviewQueueCount';

jest.mock('common/utils', () => {
  const actual = jest.requireActual<typeof import('common/utils')>('common/utils');

  return {
    ...actual,
    fetch: jest.fn(),
  };
});

interface HarnessProps {
  projectKey: string;
  isEnabled: boolean;
  refreshRevision?: number;
  onResult: (value?: number) => void;
}

const Harness = ({ projectKey, isEnabled, refreshRevision, onResult }: HarnessProps) => {
  const value = useReviewQueueCount(projectKey, isEnabled, refreshRevision);

  useEffect(() => {
    onResult(value);
  }, [onResult, value]);

  return null;
};

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const deferred = <T,>() => {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
};

describe('useReviewQueueCount', () => {
  const fetchMock = fetch as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ['', true],
    ['demo', false],
  ])('does not request a count for project %p when enabled is %p', (projectKey, isEnabled) => {
    let count: number | undefined;

    mount(
      <Harness
        projectKey={projectKey}
        isEnabled={isEnabled}
        onResult={(value) => {
          count = value;
        }}
      />,
    );

    expect(count).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('does not request a count before the first refresh revision', () => {
    mount(
      <Harness projectKey="demo" isEnabled refreshRevision={0} onResult={jest.fn()} />,
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  test('requests the complete Draft AI queue count and cancels on unmount', async () => {
    const cancel = jest.fn();
    let count: number | undefined;
    fetchMock.mockImplementationOnce((_url: string, options: { abort?: (cancel: () => void) => void }) => {
      options?.abort?.(cancel);
      return Promise.resolve({
        content: [],
        page: { number: 1, size: 1, totalElements: 5, totalPages: 5 },
      });
    });

    const wrapper = mount(
      <Harness
        projectKey="demo"
        isEnabled
        onResult={(value) => {
          count = value;
        }}
      />,
    );
    await flushPromises();

    expect(fetch).toHaveBeenCalledWith(
      URLS.testCases('demo', {
        limit: 1,
        'filter.eq.lifecycle': Lifecycle.DRAFT,
        'filter.eq.ai': true,
      }),
      expect.objectContaining({ abort: expect.any(Function) }),
    );
    expect(count).toBe(5);
    expect(fetch).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  test('refreshes once for a new revision without looping after state updates', async () => {
    let count: number | undefined;
    const onResult = (value?: number) => {
      count = value;
    };
    fetchMock
      .mockResolvedValueOnce({
        content: [],
        page: { number: 1, size: 1, totalElements: 5, totalPages: 5 },
      })
      .mockResolvedValueOnce({
        content: [],
        page: { number: 1, size: 1, totalElements: 6, totalPages: 6 },
      });
    const wrapper = mount(
      <Harness projectKey="demo" isEnabled refreshRevision={1} onResult={onResult} />,
    );
    await flushPromises();

    expect(count).toBe(5);
    expect(fetch).toHaveBeenCalledTimes(1);

    wrapper.setProps({
      projectKey: 'demo',
      isEnabled: true,
      refreshRevision: 2,
      onResult,
    });
    await flushPromises();

    expect(count).toBe(6);
    expect(fetch).toHaveBeenCalledTimes(2);

    wrapper.setProps({
      projectKey: 'demo',
      isEnabled: true,
      refreshRevision: 2,
      onResult,
    });
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('keeps the newest revision count when an older request resolves last', async () => {
    const first = deferred<{ page: { totalElements: number } }>();
    const second = deferred<{ page: { totalElements: number } }>();
    const results: (number | undefined)[] = [];
    const onResult = (value?: number) => results.push(value);
    fetchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const wrapper = mount(
      <Harness projectKey="demo" isEnabled refreshRevision={1} onResult={onResult} />,
    );

    wrapper.setProps({
      projectKey: 'demo',
      isEnabled: true,
      refreshRevision: 2,
      onResult,
    });

    await act(async () => {
      second.resolve({ page: { totalElements: 6 } });
      await second.promise;
    });
    expect(results.at(-1)).toBe(6);

    await act(async () => {
      first.resolve({ page: { totalElements: 5 } });
      await first.promise;
    });

    expect(results.at(-1)).toBe(6);
  });

  test.each([
    ['a response without pagination', () => Promise.resolve({ content: [] })],
    ['an unsuccessful request', () => Promise.reject(new Error('network failed'))],
  ])('returns no count for %s', async (_description, createResponse) => {
    let count: number | undefined;
    fetchMock.mockImplementationOnce(() => createResponse());

    mount(
      <Harness
        projectKey="demo"
        isEnabled
        onResult={(value) => {
          count = value;
        }}
      />,
    );
    await flushPromises();

    expect(count).toBeUndefined();
  });
});
