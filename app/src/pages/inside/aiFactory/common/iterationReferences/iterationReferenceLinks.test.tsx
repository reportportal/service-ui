/*
 * Copyright 2026 EPAM Systems
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import { act, type ReactElement } from 'react';
import { mount, type ReactWrapper } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  PROJECT_PIPELINE_COMPARISON_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
} from 'controllers/pages';

import { IterationReferenceLinks } from './iterationReferenceLinks';

jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('common/utils', () => ({ fetch: jest.fn() }));
jest.mock('@reportportal/ui-kit', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Button: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) =>
      React.createElement('button', { onClick }, children),
  };
});

const fetchMock = fetch as jest.MockedFunction<
  (url: string, options?: Record<string, unknown>) => Promise<unknown>
>;
const dispatch = jest.fn();
const previous = { id: 31, pipelineId: 7, iterationNumber: 1 };
const result = {
  id: 72,
  pipelineId: 7,
  iterationNumber: 3,
  rerunOf: { id: 31, iterationNumber: 1 },
};
const deferred = () => {
  let resolve!: (value: unknown) => void;
  const promise = new Promise<unknown>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};
const flush = async () => {
  await act(async () => {
    await Array.from({ length: 8 }).reduce<Promise<void>>(
      (pending) => pending.then(() => undefined),
      Promise.resolve(),
    );
  });
};
interface MountedWrapper extends ReactWrapper {
  update: () => MountedWrapper;
}
let container: HTMLDivElement;
const mountIntoContainer = (node: ReactElement) =>
  (
    mount as unknown as (
      element: ReactElement,
      options: { attachTo: HTMLElement },
    ) => MountedWrapper
  )(node, {
    attachTo: container,
  });
interface ClickNode {
  prop: (name: string) => unknown;
}
interface ClickNodes {
  filterWhere: (fn: (node: ClickNode) => boolean) => ClickNodes;
  at: (index: number) => ClickNode;
}

const text = () => container.textContent ?? '';

const handler = (wrapper: MountedWrapper, label: string) =>
  (wrapper.find('button') as unknown as ClickNodes)
    .filterWhere((node) => node.prop('children') === label)
    .at(0)
    .prop('onClick') as () => void;

describe('canonical iteration reference navigation', () => {
  let wrapper: MountedWrapper | undefined;
  const mountLinks = async (overrides = {}) => {
    await act(async () => {
      wrapper = mountIntoContainer(
        <IterationReferenceLinks
          projectKey="project"
          resourceKey={{}}
          previousIterationId={31}
          resultIterationId={72}
          {...overrides}
        />,
      );
      await Promise.resolve();
    });
    wrapper?.update();
    return wrapper;
  };
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.clearAllMocks();
    jest.mocked(useDispatch).mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
    jest.mocked(useSelector).mockReturnValue({ organizationSlug: 'org', projectSlug: 'project' });
    fetchMock.mockImplementation((url) =>
      Promise.resolve(url === URLS.pipelineIterationById('project', 31) ? previous : result),
    );
  });
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    container.remove();
  });

  test('loads at most two canonical identities on demand and navigates using their pipeline IDs', async () => {
    const mounted = await mountLinks();
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => {
      handler(mounted, 'Show iteration links')();
      await Promise.resolve();
    });
    await flush();
    mounted.update();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      URLS.pipelineIterationById('project', 31),
      URLS.pipelineIterationById('project', 72),
    ]);
    expect(text()).toContain('Source iteration #1');
    expect(text()).toContain('Fix iteration #3');
    act(() => handler(mounted, 'Fix iteration #3')());
    expect(dispatch).toHaveBeenLastCalledWith({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: { organizationSlug: 'org', projectSlug: 'project', pipelineId: 7, iterationId: 72 },
    });
    act(() => handler(mounted, 'Compare source and fix')());
    expect(dispatch).toHaveBeenLastCalledWith({
      type: PROJECT_PIPELINE_COMPARISON_PAGE,
      payload: { organizationSlug: 'org', projectSlug: 'project' },
      query: { pipeline: '7', baseline: '31', candidate: '72' },
    });
  });

  test('announces loading and prevents a duplicate read while the same lookup is in flight', async () => {
    const pending = deferred();
    fetchMock.mockReturnValue(pending.promise);
    const mounted = await mountLinks();
    const load = handler(mounted, 'Show iteration links');
    act(() => {
      load();
      load();
    });
    mounted.update();
    expect(container.querySelector('output[aria-live="polite"]')?.textContent).toContain(
      'Loading iteration links',
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(dispatch).not.toHaveBeenCalled();
    await act(async () => {
      pending.resolve(undefined);
      await Promise.resolve();
    });
    mounted.update();
    expect(text()).toContain('unavailable');
  });

  test('never reads when disabled or when no valid iteration identities are supplied', async () => {
    const mounted = await mountLinks({ isEnabled: false });
    expect(text()).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => {
      mounted.setProps({
        isEnabled: true,
        previousIterationId: undefined,
        resultIterationId: undefined,
      });
    });
    mounted.update();
    await act(async () => {
      handler(mounted, 'Show iteration links')();
      await Promise.resolve();
    });
    mounted.update();
    expect(text()).toContain('unavailable');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('deduplicates repeated identity IDs and never offers comparison with itself', async () => {
    const mounted = await mountLinks({ resultIterationId: 31 });
    act(() => handler(mounted, 'Show iteration links')());
    await flush();
    mounted.update();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(text()).toContain('unavailable');
    expect(text()).not.toContain('Compare source and fix');
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('can resolve one known source without inventing a result', async () => {
    const mounted = await mountLinks({ resultIterationId: undefined });
    act(() => handler(mounted, 'Show iteration links')());
    await flush();
    mounted.update();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(text()).toContain('Source iteration #1');
    expect(text()).not.toContain('Fix iteration #');
    expect(text()).not.toContain('Compare source and fix');
  });

  test.each([403, 404, 500])('shows %p read failures and retries with GET only', async (status) => {
    fetchMock.mockRejectedValue({ status });
    const mounted = await mountLinks();
    act(() => handler(mounted, 'Show iteration links')());
    await flush();
    mounted.update();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('could not be loaded');
    expect(dispatch).not.toHaveBeenCalled();
    fetchMock.mockImplementation((url) =>
      Promise.resolve(url === URLS.pipelineIterationById('project', 31) ? previous : result),
    );
    act(() => handler(mounted, 'Retry iteration links')());
    await flush();
    mounted.update();
    expect(text()).toContain('Fix iteration #3');
    expect(fetchMock.mock.calls.every(([, options]) => !options?.method)).toBe(true);
  });

  test.each([
    undefined,
    { ...result, id: 99 },
    { ...result, pipelineId: 9 },
    { ...result, iterationNumber: 0 },
    { ...result, rerunOf: { id: 99, iterationNumber: 1 } },
  ])(
    'does not expose routes for unavailable or mismatched canonical detail %p',
    async (candidate) => {
      fetchMock.mockImplementation((url) =>
        Promise.resolve(url.endsWith('/31') ? previous : candidate),
      );
      const mounted = await mountLinks();
      act(() => handler(mounted, 'Show iteration links')());
      await flush();
      mounted.update();
      expect(text()).toContain('Iteration links are unavailable');
      expect(mounted.find('button')).toHaveLength(0);
      expect(dispatch).not.toHaveBeenCalled();
    },
  );

  test.each(['project', 'resource', 'ids', 'flag'] as const)(
    'hides old links and rejects retained callbacks after a %s change',
    async (scope) => {
      const mounted = await mountLinks();
      act(() => handler(mounted, 'Show iteration links')());
      await flush();
      mounted.update();
      const openOld = handler(mounted, 'Fix iteration #3');
      const compareOld = handler(mounted, 'Compare source and fix');
      const changes = {
        project: { projectKey: 'other' },
        resource: { resourceKey: {} },
        ids: { resultIterationId: 73 },
        flag: { isEnabled: false },
      };
      act(() => mounted.setProps(changes[scope]));
      act(() => {
        openOld();
        compareOld();
      });
      expect(dispatch).not.toHaveBeenCalled();
      expect(text()).not.toContain('Fix iteration #3');
    },
  );

  test('ignores stale responses and retained callbacks after an A to B to A resource change', async () => {
    const old = deferred();
    fetchMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(old.promise);
    const resource = {};
    const mounted = await mountLinks({ resourceKey: resource });
    const oldLoad = handler(mounted, 'Show iteration links');
    act(() => oldLoad());
    const signal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;
    act(() => mounted.setProps({ resourceKey: {} }));
    act(() => mounted.setProps({ resourceKey: resource }));
    expect(signal.aborted).toBe(true);
    act(() => oldLoad());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      old.resolve(result);
      await Promise.resolve();
    });
    await flush();
    mounted.update();
    expect(text()).toBe('Show iteration links');
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('aborts inflight reads and retained callbacks cannot navigate after unmount', async () => {
    const pending = deferred();
    fetchMock.mockReturnValue(pending.promise);
    const mounted = await mountLinks();
    act(() => handler(mounted, 'Show iteration links')());
    const signal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;
    mounted.unmount();
    wrapper = undefined;
    expect(signal.aborted).toBe(true);
    await act(async () => {
      pending.resolve(result);
      await Promise.resolve();
    });
    expect(dispatch).not.toHaveBeenCalled();
  });
});
