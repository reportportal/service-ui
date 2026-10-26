/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { act, type ReactElement } from 'react';
import { mount, type ReactWrapper } from 'enzyme';

import { fetch } from 'common/utils';

import { LiveReviewCases } from './liveReviewCases';

jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('@reportportal/ui-kit', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Button: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) =>
      React.createElement('button', { onClick }, children),
    SystemMessage: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('div', null, children),
  };
});
jest.mock('common/utils', () => ({
  fetch: jest.fn(),
  createClassnames:
    () =>
    (...names: string[]) =>
      names.filter(Boolean).join(' '),
}));
jest.mock('../stagePanels/caseLink', () => ({ CaseLink: ({ name }: { name: string }) => name }));

const fetchMock = fetch as jest.MockedFunction<
  (url: string, options?: Record<string, unknown>) => Promise<unknown>
>;
const response = (status: 'DRAFT' | 'READY', score: number, name = 'Current case') => ({
  content: [{ id: 9101, displayId: 'TC101', name, status, metrics: { overallScore: score } }],
  page: { totalElements: 1 },
});
const deferred = () => {
  let resolve!: (value: unknown) => void;
  const promise = new Promise<unknown>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};
const flush = async () => {
  await act(async () => {
    await Array.from({ length: 6 }).reduce<Promise<void>>(
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

describe('LiveReviewCases accepted iteration refresh', () => {
  let wrapper: MountedWrapper | undefined;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.clearAllMocks();
    fetchMock.mockResolvedValue(response('DRAFT', 79));
  });
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    container.remove();
  });

  test('reloads current Library status and score for a newly accepted iteration with unchanged linked IDs', async () => {
    const iteration = { id: 31 };
    await act(async () => {
      wrapper = mountIntoContainer(
        <LiveReviewCases projectKey="project" displayIds={['TC101']} refreshIdentity={iteration} />,
      );
      await Promise.resolve();
    });
    await flush();
    wrapper?.update();
    expect(container.textContent).toContain('Draft79');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => {
      wrapper?.setProps({ displayIds: ['TC101'], refreshIdentity: iteration });
    });
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValue(response('READY', 94));
    act(() => {
      wrapper?.setProps({ refreshIdentity: { id: 31 } });
    });
    await flush();
    wrapper?.update();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain('Ready94');
    expect(fetchMock.mock.calls.every(([url]) => url.includes('filter.eq.displayId=TC101'))).toBe(
      true,
    );
    expect(fetchMock.mock.calls.some(([url]) => url.includes('/review'))).toBe(false);
  });

  test('deduplicates linked IDs before lookup and retains the maximum unique case bound', async () => {
    await act(async () => {
      wrapper = mountIntoContainer(
        <LiveReviewCases
          projectKey="project"
          displayIds={['TC101', 'TC101']}
          refreshIdentity={{ id: 31 }}
        />,
      );
      await Promise.resolve();
    });
    await flush();
    wrapper?.update();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(wrapper?.find('tbody tr')).toHaveLength(1);

    act(() => {
      wrapper?.setProps({ displayIds: Array.from({ length: 51 }, (_, i) => `TC${i}`) });
    });
    await flush();
    wrapper?.update();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Too many linked cases');
  });

  test('keeps missing and failed exact lookups unavailable and offers an explicit GET retry', async () => {
    fetchMock.mockRejectedValue({ status: 404 });
    await act(async () => {
      wrapper = mountIntoContainer(<LiveReviewCases projectKey="project" displayIds={['TC101']} />);
      await Promise.resolve();
    });
    await flush();
    wrapper?.update();
    expect(container.textContent).toContain('could not be matched uniquely');
    fetchMock.mockResolvedValue(response('READY', 94));
    act(() => {
      (wrapper?.find('button').prop('onClick') as () => void)();
    });
    await flush();
    wrapper?.update();
    expect(container.textContent).toContain('Ready94');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.every(([, options]) => !options?.method)).toBe(true);
  });

  test.each(['project', 'iteration'] as const)(
    'ignores the obsolete %s request even after an A to B to A change',
    async (scope) => {
      const original = deferred();
      const other = deferred();
      const latest = deferred();
      fetchMock
        .mockReturnValueOnce(original.promise)
        .mockReturnValueOnce(other.promise)
        .mockReturnValueOnce(latest.promise);
      const identity = { id: 31 };
      act(() => {
        wrapper = mountIntoContainer(
          <LiveReviewCases
            projectKey="project"
            displayIds={['TC101']}
            refreshIdentity={identity}
          />,
        );
      });
      const firstSignal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;
      act(() => {
        wrapper?.setProps(
          scope === 'project' ? { projectKey: 'other' } : { refreshIdentity: { id: 32 } },
        );
      });
      act(() => {
        wrapper?.setProps(
          scope === 'project' ? { projectKey: 'project' } : { refreshIdentity: identity },
        );
      });
      expect(firstSignal.aborted).toBe(true);
      await act(async () => {
        latest.resolve(response('READY', 94, 'Latest case'));
        await Promise.resolve();
      });
      await flush();
      wrapper?.update();
      expect(container.textContent).toContain('Latest caseReady94');
      await act(async () => {
        original.resolve(response('DRAFT', 12, 'Obsolete case'));
        other.resolve(response('DRAFT', 1, 'Other case'));
        await Promise.resolve();
      });
      await flush();
      wrapper?.update();
      expect(container.textContent).toContain('Latest caseReady94');
      expect(container.textContent).not.toContain('Obsolete case');
      expect(container.textContent).not.toContain('Other case');
    },
  );

  test('aborts the lookup when unmounted', async () => {
    const pending = deferred();
    fetchMock.mockReturnValue(pending.promise);
    await act(async () => {
      wrapper = mountIntoContainer(<LiveReviewCases projectKey="project" displayIds={['TC101']} />);
      await Promise.resolve();
    });
    wrapper?.update();
    const signal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;
    wrapper?.unmount();
    wrapper = undefined;
    expect(signal.aborted).toBe(true);
  });
});
