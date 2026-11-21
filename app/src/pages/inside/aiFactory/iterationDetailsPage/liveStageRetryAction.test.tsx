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

import { act, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { AxiosResponse } from 'axios';

import { fetch } from 'common/utils';

import { LiveStageRetryAction } from './liveStageRetryAction';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));
jest.mock('@reportportal/ui-kit', () => ({
  Button: ({ children, onClick, disabled }: ComponentProps<'button'>) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  RerunIcon: () => null,
}));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }, args?: { stage: string }) =>
      defaultMessage.replace('{stage}', args?.stage ?? ''),
  }),
}));

const fetchMock = jest.mocked(fetch);
const reply = (status: number) => ({ status }) as AxiosResponse;

describe('LiveStageRetryAction', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onRefresh = jest.fn();
  const testEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = testEnvironment.IS_REACT_ACT_ENVIRONMENT;

  beforeAll(() => {
    testEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    testEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  });

  const render = (
    overrides: Partial<ComponentProps<typeof LiveStageRetryAction>> = {},
    key = 'demo:10:22:1',
  ) => {
    act(() =>
      root.render(
        <LiveStageRetryAction
          key={key}
          projectKey="demo"
          iterationId={10}
          stageId={22}
          stageLabel="Upload"
          onRefresh={onRefresh}
          disabled={false}
          {...overrides}
        />,
      ),
    );
  };

  const click = () => container.querySelector('button')?.click();
  const clickAndSettle = () =>
    act(async () => {
      click();
      await Promise.resolve();
    });

  beforeEach(() => {
    onRefresh.mockClear();
    fetchMock.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  test('posts once and refreshes the same iteration on 202, keeping that attempt locked', async () => {
    let complete!: (response: AxiosResponse) => void;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        complete = resolve;
      }),
    );
    render();
    expect(container.textContent).toContain('Retry Upload');
    expect(fetchMock).not.toHaveBeenCalled();

    act(() => {
      click();
      click();
    });
    expect(container.querySelector('button')?.disabled).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/project/demo/pipeline/iteration/10/stage/22/retry'),
      expect.objectContaining({ method: 'POST', signal: expect.any(AbortSignal) }),
      true,
    );
    expect(onRefresh).not.toHaveBeenCalled();

    await act(async () => {
      complete(reply(202));
      await Promise.resolve();
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Retry requested');
    expect(container.querySelector('button')?.disabled).toBe(true);
    act(click);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    render({}, 'demo:10:22:2');
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  test.each([
    [400, /cannot be retried/i, false],
    [403, /do not have permission/i, false],
    [404, /could not be found/i, false],
    [409, /already running or being retried/i, true],
  ])('shows an appropriate response for %s', async (status, feedback, shouldRefresh) => {
    fetchMock.mockResolvedValue(reply(status));
    render();
    await clickAndSettle();
    expect(container.textContent).toMatch(feedback);
    expect(onRefresh).toHaveBeenCalledTimes(shouldRefresh ? 1 : 0);
    expect(container.querySelector('button')?.disabled).toBe(shouldRefresh);
  });

  test('keeps a disconnected stage disabled and refreshes CI after a stale 40916', async () => {
    const onRefreshCiConnection = jest.fn();
    render({ isCiUnavailable: true, onRefreshCiConnection });
    await clickAndSettle();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(container.textContent).toMatch(/until the pipeline is connected to CI/i);

    fetchMock.mockResolvedValue({ status: 409, data: { errorCode: 40916 } } as AxiosResponse);
    render({ isCiUnavailable: false, onRefreshCiConnection });
    await clickAndSettle();
    expect(onRefreshCiConnection).toHaveBeenCalledTimes(1);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(container.textContent).toMatch(/until the pipeline is connected to CI/i);
  });

  test.each([new Error('Network error'), { status: 503 }])(
    'locks an unconfirmed outcome for this attempt and refreshes once (%s)',
    async (error) => {
      fetchMock.mockRejectedValue(error);
      render();
      await clickAndSettle();
      expect(container.textContent).toMatch(/could not be confirmed/i);
      expect(onRefresh).toHaveBeenCalledTimes(1);
      expect(container.querySelector('button')?.disabled).toBe(true);
      act(click);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onRefresh).toHaveBeenCalledTimes(1);

      render({}, 'demo:10:22:2');
      expect(container.querySelector('button')?.disabled).toBe(false);
    },
  );

  test('does not send while the iteration is loading', () => {
    render({ disabled: true });
    act(click);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('aborts the old request and ignores late success after navigation', async () => {
    let complete!: (response: AxiosResponse) => void;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        complete = resolve;
      }),
    );
    render();
    act(click);
    const signal = fetchMock.mock.calls[0][1]?.signal;
    render({ projectKey: 'other' }, 'other:10:22:1');
    expect(signal?.aborted).toBe(true);

    await act(async () => {
      complete(reply(202));
      await Promise.resolve();
    });
    expect(onRefresh).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('Retry requested');
  });
});
