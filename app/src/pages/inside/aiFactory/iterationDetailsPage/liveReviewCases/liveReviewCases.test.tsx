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
    Button: ({ children, onClick, disabled }: React.ComponentProps<'button'>) =>
      React.createElement('button', { onClick, disabled }, children),
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
jest.mock('../stagePanels/caseLink', () => ({
  CaseLink: ({ name, testCaseId }: { name: string; testCaseId: number }) => (
    <a href={`/case/${testCaseId}`}>{name}</a>
  ),
}));

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

describe('LiveReviewCases', () => {
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

  const clickButton = async (label: string) => {
    const button = Array.from(container.querySelectorAll('button')).find(
      (element) => element.textContent === label,
    );
    expect(button).toBeDefined();
    act(() => {
      button?.click();
    });
    await flush();
    wrapper?.update();
  };

  test('refreshes the score and status for the same iteration', async () => {
    await act(async () => {
      wrapper = mountIntoContainer(
        <LiveReviewCases projectKey="project" iterationId={31} refreshVersion={1} />,
      );
      await Promise.resolve();
    });
    await flush();
    wrapper?.update();
    expect(container.textContent).toContain('Draft79');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => {
      wrapper?.setProps({ refreshVersion: 1 });
    });
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const refreshResult = deferred();
    fetchMock.mockReturnValueOnce(refreshResult.promise);
    act(() => {
      wrapper?.setProps({ refreshVersion: 2 });
    });
    expect(container.textContent).toContain('Draft79');
    act(() => {
      refreshResult.resolve(response('READY', 94));
    });
    await flush();
    wrapper?.update();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain('Ready94');
    expect(fetchMock.mock.calls.every(([url]) => url.includes('filter.eq.iterationId=31'))).toBe(
      true,
    );
    expect(fetchMock.mock.calls.some(([url]) => url.includes('/review'))).toBe(false);
  });

  test('opens a case after the first 50 and uses its numeric route ID', async () => {
    fetchMock.mockImplementation((url) => {
      const offset = Number(new URL(url, 'https://example.test').searchParams.get('offset'));
      return Promise.resolve({
        content: Array.from({ length: Math.min(25, 51 - offset) }, (_, index) => {
          const number = offset + index + 1;
          return { id: 9000 + number, displayId: `TC${number}`, name: `Case ${number}` };
        }),
        page: { totalElements: 51 },
      });
    });
    await act(async () => {
      wrapper = mountIntoContainer(<LiveReviewCases projectKey="project" iterationId={31} />);
      await Promise.resolve();
    });
    await flush();
    wrapper?.update();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(wrapper?.find('tbody tr')).toHaveLength(25);
    await clickButton('Next');
    expect(container.textContent).toContain('Case 26');
    expect(wrapper?.find('tbody tr')).toHaveLength(25);
    await clickButton('Next');
    expect(wrapper?.find('tbody tr')).toHaveLength(1);
    const lastCase = container.querySelector('tbody a');
    expect(lastCase?.getAttribute('href')).toBe('/case/9051');
    expect(lastCase?.textContent).toBe('TC51');
    expect(
      fetchMock.mock.calls.map(([url]) =>
        new URL(url, 'https://example.test').searchParams.get('offset'),
      ),
    ).toEqual(['0', '25', '50']);
  });

  test('renders Ready attribution from the existing Library list response', async () => {
    const at = '2026-11-21T10:00:00Z';
    const actors = [
      { type: 'USER', user: { id: 7, login: 'user1', fullName: 'Ann Smith' }, at },
      { type: 'USER', user: { id: 8, login: 'user2', fullName: ' ' }, at },
      { type: 'AUTO_READY', at },
      { type: 'USER', user: {}, at },
      { type: 'SYSTEM', user: { fullName: 'Unrecognized actor' }, at },
      null,
      undefined,
    ];
    fetchMock.mockResolvedValue({
      content: actors.map((madeReadyBy, index) => ({
        id: 9101 + index,
        displayId: `TC${101 + index}`,
        name: `Case ${index + 1}`,
        status: madeReadyBy === null ? 'DRAFT' : 'READY',
        ...(madeReadyBy === undefined ? {} : { madeReadyBy }),
      })),
      page: { totalElements: actors.length },
    });
    await act(async () => {
      wrapper = mountIntoContainer(<LiveReviewCases projectKey="project" iterationId={31} />);
      await Promise.resolve();
    });
    await flush();
    wrapper?.update();

    expect(container.querySelector('th:last-child')?.textContent).toBe('Made Ready by');
    expect(
      Array.from(container.querySelectorAll('tbody td:last-child'), (cell) => cell.textContent),
    ).toEqual(['Ann Smith', 'user2', 'Auto-Ready', '—', '—', '—', '—']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('offers an explicit GET retry after a list error', async () => {
    fetchMock.mockRejectedValue({ status: 404 });
    await act(async () => {
      wrapper = mountIntoContainer(<LiveReviewCases projectKey="project" iterationId={31} />);
      await Promise.resolve();
    });
    await flush();
    wrapper?.update();
    expect(container.textContent).toContain('Could not load Library cases');
    expect(container.querySelector('tbody')).toBeNull();
    fetchMock.mockResolvedValue(response('READY', 94));
    await clickButton('Refresh');
    expect(container.textContent).toContain('Ready94');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.every(([, options]) => !options?.method)).toBe(true);
  });

  test('shows the empty iteration state after an authoritative zero total', async () => {
    fetchMock.mockResolvedValue({ content: [], page: { totalElements: 0 } });
    await act(async () => {
      wrapper = mountIntoContainer(
        <div>
          <LiveReviewCases projectKey="project" iterationId={31} />
        </div>,
      );
      await Promise.resolve();
    });
    await flush();
    wrapper?.update();
    expect(container.textContent).toContain('No Library cases are linked to this iteration');
    expect(container.textContent).not.toContain('Could not load Library cases');
    expect(container.querySelector('tbody')).toBeNull();
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
      act(() => {
        wrapper = mountIntoContainer(<LiveReviewCases projectKey="project" iterationId={31} />);
      });
      const firstSignal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;
      act(() => {
        wrapper?.setProps(scope === 'project' ? { projectKey: 'other' } : { iterationId: 32 });
      });
      act(() => {
        wrapper?.setProps(scope === 'project' ? { projectKey: 'project' } : { iterationId: 31 });
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
      wrapper = mountIntoContainer(<LiveReviewCases projectKey="project" iterationId={31} />);
      await Promise.resolve();
    });
    wrapper?.update();
    const signal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;
    wrapper?.unmount();
    wrapper = undefined;
    expect(signal.aborted).toBe(true);
  });
});
