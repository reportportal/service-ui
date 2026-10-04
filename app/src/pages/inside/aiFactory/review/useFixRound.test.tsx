/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { act, useEffect } from 'react';
import { mount } from 'enzyme';

import { fetch } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { usePolling } from 'pages/inside/aiFactory/common';
import { FixRoundStatus } from 'types/aiFactory';

import { useFixRound, type FixRoundLoadState } from './useFixRound';

jest.mock('common/utils', () => ({
  ERROR_CANCELED: 'REQUEST_CANCELED',
  fetch: jest.fn(),
}));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('controllers/notification', () => ({
  showErrorNotification: (payload: unknown) => ({ type: 'ERROR', payload }),
  showSuccessNotification: (payload: unknown) => ({ type: 'SUCCESS', payload }),
  showWarningNotification: (payload: unknown) => ({ type: 'WARNING', payload }),
}));
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));
jest.mock('pages/inside/aiFactory/common', () => ({
  usePolling: jest.fn(),
}));
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
>;

interface ProbeProps {
  onState: (state: FixRoundLoadState) => void;
  onFinished?: jest.Mock;
}

const Probe = ({ onState, onFinished }: ProbeProps) => {
  const state = useFixRound('demo', 42, true, { onFinished });
  useEffect(() => onState(state), [onState, state]);
  return <div />;
};

const latestState = (onState: jest.Mock<void, [FixRoundLoadState]>) => {
  const state = onState.mock.lastCall?.[0];
  if (!state) throw new Error('The fix-round hook did not report its state');
  return state;
};

const runningRound = {
  round: 1,
  testCaseId: 42,
  displayId: 'TC106',
  status: FixRoundStatus.RUNNING,
  pushedBy: 'Reviewer',
  pushedAt: 100,
  commentsCount: 2,
};

describe('useFixRound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: true,
    } as ReturnType<typeof useUserPermissions>);
  });

  test('starts a fix round after loading its history', async () => {
    const onState = jest.fn<void, [FixRoundLoadState]>();
    fetchMock.mockResolvedValueOnce([]).mockResolvedValueOnce(runningRound);

    await act(async () => {
      mount(<Probe onState={onState} />);
      await Promise.resolve();
    });
    await act(async () => {
      await latestState(onState).start();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/fix-round'), {
      method: 'POST',
    });
    expect(latestState(onState).current).toEqual(runningRound);
  });

  test('keeps the current state unchanged when starting fails', async () => {
    const onState = jest.fn<void, [FixRoundLoadState]>();
    fetchMock.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('JOB_START_FAILED'));

    await act(async () => {
      mount(<Probe onState={onState} />);
      await Promise.resolve();
    });
    await act(async () => {
      await latestState(onState).start();
    });

    expect(latestState(onState).current).toBeNull();
    expect(latestState(onState).isError).toBe(true);
  });

  test('reports a terminal result after polling a running round', async () => {
    const onState = jest.fn<void, [FixRoundLoadState]>();
    const onFinished = jest.fn();
    const passedRound = {
      ...runningRound,
      status: FixRoundStatus.PASSED,
      finishedAt: 200,
      scoreBefore: 81,
      scoreAfter: 93,
    };
    fetchMock.mockResolvedValueOnce([runningRound]).mockResolvedValueOnce([passedRound]);

    await act(async () => {
      mount(<Probe onState={onState} onFinished={onFinished} />);
      await Promise.resolve();
    });
    const pollingCalls = jest.mocked(usePolling).mock.calls;
    const poll = pollingCalls[pollingCalls.length - 1]?.[0];
    if (!poll) throw new Error('Polling callback was not registered');
    await act(async () => {
      poll();
      await Promise.resolve();
    });

    expect(latestState(onState).current).toEqual(passedRound);
    expect(onFinished).toHaveBeenCalledWith(passedRound);
  });

  test('keeps fix-round history readable but does not start a round for a viewer', async () => {
    const onState = jest.fn<void, [FixRoundLoadState]>();
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: false,
    } as ReturnType<typeof useUserPermissions>);
    fetchMock.mockResolvedValueOnce([runningRound]);

    await act(async () => {
      mount(<Probe onState={onState} />);
      await Promise.resolve();
    });

    expect(latestState(onState).current).toEqual(runningRound);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await latestState(onState).start();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(latestState(onState).isStarting).toBe(false);
  });
});
