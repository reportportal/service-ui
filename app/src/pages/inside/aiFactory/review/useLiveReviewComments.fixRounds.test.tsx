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
import { mount, type ReactWrapper } from 'enzyme';
import { useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { idSelector } from 'controllers/user';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { CommentTargetType } from 'types/aiFactory';

import { LIVE_FIX_OBSERVATION_TIMEOUT, LIVE_FIX_POLL_INTERVAL } from './liveFixRoundMonitor';
import { useLiveReviewComments, type LiveReviewCommentsLoadState } from './useLiveReviewComments';

jest.mock('common/utils', () => ({ ERROR_CANCELED: 'REQUEST_CANCELED', fetch: jest.fn() }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('controllers/user', () => ({ idSelector: jest.fn() }));

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>, raw?: boolean) => Promise<unknown>
>;
const comment = {
  id: 21,
  authorId: 12,
  targetType: 'PRECONDITION',
  text: 'Clarify the setup',
  state: 'NOT_SENT',
  createdAt: '2026-10-24T12:00:00Z',
};
const review = (overrides: Record<string, unknown> = {}) => ({
  comments: [comment],
  unsentCount: 1,
  fixInProgress: false,
  ...overrides,
});
const round = (status = 'PENDING', overrides: Record<string, unknown> = {}) => ({
  id: 5,
  testCaseId: 42,
  roundNumber: 1,
  status,
  ...overrides,
});
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};
interface MountedWrapper extends ReactWrapper {
  update: () => MountedWrapper;
}

interface ProbeProps {
  projectKey?: string;
  testCaseId?: number;
  versionId?: number;
  enabled?: boolean;
  canApprove?: boolean;
  allowPush?: boolean;
  onFixCompleted?: () => void;
  onState: (state: LiveReviewCommentsLoadState) => void;
}
const Probe = ({
  projectKey = 'demo',
  testCaseId = 42,
  versionId = 100,
  enabled = true,
  canApprove = false,
  allowPush = true,
  onFixCompleted,
  onState,
}: ProbeProps) => {
  const state = useLiveReviewComments(projectKey, testCaseId, enabled, {
    versionId,
    canApprove,
    allowPush,
    onFixCompleted,
  });
  useEffect(() => onState(state), [onState, state]);
  return <div />;
};
const flush = () =>
  Array.from({ length: 12 }).reduce<Promise<void>>(
    (pending) => pending.then(() => undefined),
    Promise.resolve(),
  );
const payload = { target: { type: CommentTargetType.PRECONDITION }, text: 'Clarify setup' };

describe('native Review Push and fix monitoring', () => {
  let wrapper: MountedWrapper | undefined;
  let onState: jest.Mock<void, [LiveReviewCommentsLoadState]>;
  let serverReview: unknown;
  let serverRound: unknown;
  let onFixCompleted: jest.Mock;
  const state = () => {
    const current = onState.mock.lastCall?.[0];
    if (!current) throw new Error('Review state has not been reported');
    return current;
  };
  const render = async (props: Partial<ProbeProps> = {}) => {
    await act(async () => {
      wrapper = mount(
        <Probe onState={onState} onFixCompleted={onFixCompleted} {...props} />,
      ) as MountedWrapper;
      await flush();
    });
    wrapper?.update();
  };
  const update = async (props: Partial<ProbeProps> = {}) => {
    await act(async () => {
      wrapper?.setProps(props);
      await flush();
    });
  };
  const tick = async (duration = LIVE_FIX_POLL_INTERVAL) => {
    await act(async () => {
      jest.advanceTimersByTime(duration);
      await flush();
    });
  };
  const push = async () => {
    let result: boolean | undefined;
    await act(async () => {
      result = await state().pushToAgent?.();
      await flush();
    });
    return result;
  };
  const reads = () => fetchMock.mock.calls.filter(([, options]) => !options?.method);
  const starts = () =>
    fetchMock.mock.calls.filter(
      ([url, options]) => url.endsWith('/fix-round') && options?.method === 'POST',
    );
  const roundReads = () => reads().filter(([url]) => /\/review\/fix-round\/\d+$/.test(url));

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    fetchMock.mockReset();
    onState = jest.fn<void, [LiveReviewCommentsLoadState]>();
    onFixCompleted = jest.fn();
    serverReview = review();
    serverRound = round();
    jest
      .mocked(useSelector)
      .mockImplementation((selector) => (selector === idSelector ? 12 : undefined));
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: true,
    } as ReturnType<typeof useUserPermissions>);
    fetchMock.mockImplementation((url, options, raw) =>
      Promise.resolve().then(() => {
        if (url.endsWith('/review') && !options?.method) return serverReview;
        if (/\/review\/fix-round\/\d+$/.test(url))
          return raw ? { status: 200, data: serverRound } : serverRound;
        if (url.endsWith('/review/fix-round') && options?.method === 'POST') {
          return raw ? { status: 200, data: serverRound } : serverRound;
        }
        if (options?.method === 'PATCH') return { status: 200, data: {} };
        if (url.includes('/review/comment')) return comment;
        throw new Error(`Unexpected request ${url}`);
      }),
    );
  });

  afterEach(() => {
    act(() => wrapper?.update().unmount());
    wrapper = undefined;
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('starts one native round and latches fixing before allowing another command', async () => {
    await render();
    expect(state().canPush).toBe(true);
    const retained = state();
    expect(await push()).toBe(true);
    expect(state()).toMatchObject({ fixInProgress: true, canPush: false });
    expect(state().fixRoundState).toMatchObject({ id: 5, roundNumber: 1, status: 'PENDING' });
    await act(async () => {
      await retained.pushToAgent?.();
      await retained.addComment(payload);
      await retained.discardPending();
      await retained.approveReady?.();
      await flush();
    });
    expect(starts()).toHaveLength(1);
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false);
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'PATCH')).toBe(false);
    expect(
      fetchMock.mock.calls.some(([url]) => /\/ai(?:\/|$)|\/review-comment(?:\/|$)/.test(url)),
    ).toBe(false);
  });

  test.each([
    ['no unsent comments', { unsentCount: 0 }, {}],
    ['already fixing', { fixInProgress: true }, {}],
    ['malformed Review', { unsentCount: '1' }, {}],
    ['disabled feature', {}, { enabled: false }],
    ['unsupported Push surface', {}, { allowPush: false }],
    ['invalid case identity', {}, { testCaseId: 0 }],
  ])('blocks Push when %s', async (_label, overrides, props) => {
    serverReview = review(overrides);
    await render(props);
    expect(state().canPush).toBe(false);
    expect(await push()).toBe(false);
    expect(starts()).toHaveLength(0);
  });

  test('blocks Push until the initial Review load finishes', async () => {
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    await render();
    expect(state()).toMatchObject({ isLoading: true, canPush: false });
    expect(await push()).toBe(false);
    await act(async () => {
      request.resolve(review());
      await flush();
    });
    expect(state().canPush).toBe(true);
  });

  test('a viewer monitors an existing fix but cannot start another one', async () => {
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: false,
    } as ReturnType<typeof useUserPermissions>);
    serverReview = review({
      fixInProgress: true,
      fixRound: 1,
      comments: [{ ...comment, state: 'SENT', roundNumber: 1, fixRoundId: 5 }],
    });
    await render();
    await tick();
    expect(state().fixInProgress).toBe(true);
    expect(await push()).toBe(false);
    expect(roundReads().length).toBeGreaterThan(0);
    expect(roundReads().every(([url]) => url.endsWith('/5'))).toBe(true);
    expect(starts()).toHaveLength(0);
  });

  test('a resumed explicit round ID stays locked through a stale Review false before its first round read', async () => {
    serverReview = review({
      unsentCount: 0,
      fixInProgress: true,
      fixRound: 1,
      comments: [{ ...comment, state: 'SENT', roundNumber: 1, fixRoundId: 5 }],
    });
    await render({ canApprove: true });
    expect(roundReads()).toHaveLength(0);
    expect(state().fixInProgress).toBe(true);
    serverReview = review();
    await act(async () => {
      state().reload();
      await flush();
    });
    expect(state()).toMatchObject({ fixInProgress: true, canPush: false, fixCompleted: false });
    expect(onFixCompleted).not.toHaveBeenCalled();
    await act(async () => {
      expect(await state().pushToAgent?.()).toBe(false);
      expect(await state().approveReady?.()).toBe(false);
      expect(await state().addComment(payload)).toBe(false);
      expect(await state().discardPending()).toBe(false);
    });
    expect(starts()).toHaveLength(0);
    await tick();
    expect(roundReads().length).toBeGreaterThan(0);
    expect(roundReads().every(([url]) => url.endsWith('/5'))).toBe(true);
    expect(state().fixRoundState).toMatchObject({ id: 5, status: 'PENDING' });
    serverRound = round('FIXED');
    serverReview = review({ comments: [], unsentCount: 0 });
    await tick();
    expect(state().fixInProgress).toBe(false);
    expect(onFixCompleted).toHaveBeenCalledTimes(1);
  });

  test('an external fix on the same case and version clears prior completion feedback and monitors its new ID', async () => {
    await render();
    await push();
    serverRound = round('FIXED');
    serverReview = review({ comments: [], unsentCount: 0 });
    await tick();
    expect(state()).toMatchObject({ fixCompleted: true, fixInProgress: false });
    expect(state().fixRoundState).toMatchObject({ id: 5, status: 'FIXED' });
    serverReview = review({
      unsentCount: 0,
      fixInProgress: true,
      fixRound: 2,
      comments: [{ ...comment, state: 'SENT', roundNumber: 2, fixRoundId: 6 }],
    });
    serverRound = round('PENDING', { id: 6, roundNumber: 2 });
    await act(async () => {
      state().reload();
      await flush();
    });
    expect(state()).toMatchObject({ fixCompleted: false, fixInProgress: true, canPush: false });
    expect(state().fixRoundState?.id).not.toBe(5);
    expect(state().fixRoundState?.status).not.toBe('FIXED');
    await tick();
    expect(roundReads().at(-1)?.[0]).toMatch(/\/review\/fix-round\/6$/);
    expect(state().fixRoundState).toMatchObject({ id: 6, roundNumber: 2, status: 'PENDING' });
    await update({ versionId: 101 });
    expect(state()).toMatchObject({ fixCompleted: false, fixInProgress: true });
    expect(state().fixRoundState?.id).not.toBe(5);
    expect(onFixCompleted).toHaveBeenCalledTimes(1);
    expect(starts()).toHaveLength(1);
  });

  test('polls native round ID 5 rather than display round number 1', async () => {
    await render();
    await push();
    await tick();
    expect(roundReads().length).toBeGreaterThan(0);
    expect(roundReads().every(([url]) => url.endsWith('/5'))).toBe(true);
    expect(roundReads().some(([url]) => url.endsWith('/1'))).toBe(false);
  });

  test('an existing fix without an explicit round ID polls Review without guessing its ID', async () => {
    serverReview = review({ fixInProgress: true, fixRound: 1 });
    await render();
    const initialReads = reads().length;
    await tick();
    expect(reads().length).toBeGreaterThan(initialReads);
    expect(roundReads()).toHaveLength(0);
    serverReview = review({ fixInProgress: false, unsentCount: 0 });
    await tick();
    expect(state().fixInProgress).toBe(false);
    expect(onFixCompleted).toHaveBeenCalledTimes(1);
    expect(state().fixRoundState?.status).not.toBe('FIXED');
  });

  test.each(['FIXED', 'FIXED_GRADE_FAILED', 'FAILED'])(
    'exposes server terminal %s and refreshes the case and Review once',
    async (status) => {
      await render();
      await push();
      const beforeTerminalReads = reads().length;
      serverRound = round(status);
      serverReview = review({ comments: [], unsentCount: 0 });
      await tick();
      expect(state().fixRoundState).toMatchObject({ status, id: 5, roundNumber: 1 });
      expect(state().fixInProgress).toBe(false);
      expect(onFixCompleted).toHaveBeenCalledTimes(1);
      expect(reads().length).toBeGreaterThan(beforeTerminalReads);
      const afterTerminalReads = reads().length;
      await tick(LIVE_FIX_POLL_INTERVAL * 3);
      expect(onFixCompleted).toHaveBeenCalledTimes(1);
      expect(reads()).toHaveLength(afterTerminalReads);
      expect(state().fixRoundState).not.toHaveProperty('grade');
      expect(starts()).toHaveLength(1);
    },
  );

  test('a stale Review false cannot unlock an accepted round before its terminal status', async () => {
    await render();
    await push();
    await act(async () => {
      state().reload();
      await flush();
    });
    expect(state()).toMatchObject({ fixInProgress: true, canPush: false });
    expect(await push()).toBe(false);
    expect(starts()).toHaveLength(1);
  });

  test('never overlaps round reads when the previous response is still pending', async () => {
    await render();
    await push();
    const request = deferred<unknown>();
    fetchMock.mockImplementationOnce(() => request.promise);
    await tick();
    const count = roundReads().length;
    await tick(LIVE_FIX_POLL_INTERVAL * 5);
    expect(roundReads()).toHaveLength(count);
    await act(async () => {
      request.resolve({ status: 200, data: round() });
      await flush();
    });
    await tick();
    expect(roundReads().length).toBeGreaterThan(count);
  });

  test('read failure pauses monitoring and retry performs reads without another POST', async () => {
    await render();
    await push();
    fetchMock.mockRejectedValueOnce({ errorCode: 40401, message: 'Round disappeared' });
    await tick();
    expect(state().fixMonitoringError).toBeTruthy();
    expect(state()).toMatchObject({ fixInProgress: true, canPush: false });
    const count = roundReads().length;
    await tick(LIVE_FIX_POLL_INTERVAL * 3);
    expect(roundReads()).toHaveLength(count);
    await act(async () => {
      state().retryFixMonitoring?.();
      await flush();
    });
    await tick();
    expect(roundReads().length).toBeGreaterThan(count);
    expect(starts()).toHaveLength(1);
    expect(state().fixRoundState?.status).not.toBe('FAILED');
  });

  test('raw round 404 cannot unlock a known accepted round from a stale Review false', async () => {
    await render();
    await push();
    fetchMock.mockResolvedValueOnce({ status: 404, data: { message: 'Not found' } });
    await tick();
    expect(state().fixMonitoringError).toBe('MISSING');
    expect(state()).toMatchObject({ fixInProgress: true, canPush: false });
    expect(onFixCompleted).not.toHaveBeenCalled();
    expect(await push()).toBe(false);
    await act(async () => {
      state().retryFixMonitoring?.();
      await flush();
    });
    await tick();
    expect(starts()).toHaveLength(1);
    expect(state().fixInProgress).toBe(true);
  });

  test('observation timeout preserves fixing and only read-only retry can resume it', async () => {
    await render();
    await push();
    await tick(LIVE_FIX_OBSERVATION_TIMEOUT + LIVE_FIX_POLL_INTERVAL);
    expect(state().fixMonitoringError).toBe('TIMEOUT');
    expect(state()).toMatchObject({ fixInProgress: true, canPush: false });
    const count = roundReads().length;
    await tick(LIVE_FIX_POLL_INTERVAL * 2);
    expect(roundReads()).toHaveLength(count);
    await act(async () => {
      state().retryFixMonitoring?.();
      await flush();
    });
    await tick();
    expect(roundReads().length).toBeGreaterThan(count);
    expect(starts()).toHaveLength(1);
  });

  test('bounds an unresponsive polling request by the observation deadline', async () => {
    await render();
    await push();
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    await tick();
    const signal = roundReads().at(-1)?.[1]?.signal as AbortSignal;
    await tick(LIVE_FIX_OBSERVATION_TIMEOUT);
    expect(state().fixMonitoringError).toBe('TIMEOUT');
    expect(signal.aborted).toBe(true);
    expect(state().fixInProgress).toBe(true);
    await act(async () => {
      request.resolve({ status: 200, data: round('FIXED') });
      await flush();
    });
    expect(onFixCompleted).not.toHaveBeenCalled();
    expect(state().fixRoundState?.status).toBe('PENDING');
    expect(starts()).toHaveLength(1);
  });

  test.each([
    [{ status: 409, data: {} }, 'CONFLICT'],
    [{ status: 404, data: {} }, 'FAILED'],
  ])(
    'reconciles definite rejected starts without inventing a FAILED round: %j',
    async (response, reason) => {
      await render();
      fetchMock.mockResolvedValueOnce(response);
      expect(await push()).toBe(false);
      expect(state().fixStartError).toBe(reason);
      expect(state().fixRoundState).toBeUndefined();
      expect(onFixCompleted).not.toHaveBeenCalled();
      expect(reads().length).toBeGreaterThan(1);
      await tick(LIVE_FIX_POLL_INTERVAL * 3);
      expect(starts()).toHaveLength(1);
    },
  );

  test.each(['malformed accepted response', 'network-lost response'])(
    'keeps an uncertain start locked and reconciles read-only: %s',
    async (kind) => {
      await render();
      if (kind.startsWith('malformed')) fetchMock.mockResolvedValueOnce({ status: 200, data: {} });
      else fetchMock.mockRejectedValueOnce(new Error('Network request failed'));
      expect(await push()).toBe(false);
      expect(state().fixStartError).toBe('UNCONFIRMED');
      expect(state()).toMatchObject({ fixInProgress: true, canPush: false });
      await tick();
      expect(await push()).toBe(false);
      expect(starts()).toHaveLength(1);
      expect(roundReads()).toHaveLength(0);
      expect(state().fixRoundState).toBeUndefined();
    },
  );

  test('a shared command semaphore excludes Push while a comment request is pending', async () => {
    await render();
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    let mutation!: Promise<boolean>;
    await act(async () => {
      mutation = state().addComment(payload);
      expect(await state().pushToAgent?.()).toBe(false);
      await flush();
    });
    expect(starts()).toHaveLength(0);
    await act(async () => {
      request.resolve(comment);
      await mutation;
      await flush();
    });
    expect(state().canPush).toBe(true);
  });

  test('Push excludes comment and approval commands synchronously before a re-render', async () => {
    await render({ canApprove: true });
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    const retained = state();
    let start!: Promise<boolean> | undefined;
    await act(async () => {
      start = retained.pushToAgent?.();
      expect(await retained.addComment(payload)).toBe(false);
      expect(await retained.approveReady?.()).toBe(false);
      expect(await retained.pushToAgent?.()).toBe(false);
      await flush();
    });
    expect(starts()).toHaveLength(1);
    await act(async () => {
      request.resolve({ status: 200, data: round() });
      await start;
      await flush();
    });
    expect(state().fixInProgress).toBe(true);
  });

  test('an approval in flight excludes Push and its success latch survives a stale comment count', async () => {
    serverReview = review({ unsentCount: 0 });
    await render({ canApprove: true });
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    const retained = state();
    let approval!: Promise<boolean> | undefined;
    await act(async () => {
      approval = retained.approveReady?.();
      expect(await retained.pushToAgent?.()).toBe(false);
      await flush();
    });
    serverReview = review({ unsentCount: 1 });
    await act(async () => {
      request.resolve({ status: 200, data: {} });
      await approval;
      await flush();
    });
    expect(state().isApproved).toBe(true);
    expect(state().canPush).toBe(false);
    expect(await push()).toBe(false);
    expect(starts()).toHaveLength(0);
  });

  test('Review reload while a start is pending does not invalidate its accepted outcome', async () => {
    await render();
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    let start!: Promise<boolean> | undefined;
    await act(async () => {
      start = state().pushToAgent?.();
      await flush();
    });
    await act(async () => {
      state().reload();
      await flush();
    });
    await act(async () => {
      request.resolve({ status: 200, data: round() });
      await start;
      await flush();
    });
    expect(state()).toMatchObject({ fixInProgress: true, canPush: false });
    expect(state().fixRoundState).toMatchObject({ id: 5 });
  });

  test.each([
    ['project', { projectKey: 'other' }],
    ['case', { testCaseId: 43 }],
    ['version', { versionId: 101 }],
    ['feature flag', { enabled: false }],
  ])(
    'drops stale start responses and retained commands after a %s change',
    async (_label, props) => {
      await render();
      const oldState = state();
      const request = deferred<unknown>();
      fetchMock.mockReturnValueOnce(request.promise);
      let start!: Promise<boolean> | undefined;
      await act(async () => {
        start = oldState.pushToAgent?.();
        await flush();
      });
      await update(props);
      await act(async () => {
        expect(await oldState.pushToAgent?.()).toBe(false);
        request.resolve({ status: 200, data: round() });
        expect(await start).toBe(false);
        await flush();
      });
      expect(onFixCompleted).not.toHaveBeenCalled();
      expect(state().fixRoundState).toBeUndefined();
    },
  );

  test('case A to B to A rejects old retained handlers and late results', async () => {
    await render();
    const oldState = state();
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    let start!: Promise<boolean> | undefined;
    await act(async () => {
      start = oldState.pushToAgent?.();
      await flush();
    });
    await update({ testCaseId: 43 });
    await update({ testCaseId: 42 });
    await act(async () => {
      expect(await oldState.pushToAgent?.()).toBe(false);
      request.resolve({ status: 200, data: round() });
      expect(await start).toBe(false);
      await flush();
    });
    expect(state().fixRoundState).toBeUndefined();
    expect(starts()).toHaveLength(1);
  });

  test('permission loss and regain invalidate retained commands while preserving a known fix lock', async () => {
    await render();
    await push();
    const retained = state();
    jest
      .mocked(useUserPermissions)
      .mockReturnValue({ canReviewAiTestCases: false } as ReturnType<typeof useUserPermissions>);
    await update();
    expect(state().fixInProgress).toBe(true);
    jest
      .mocked(useUserPermissions)
      .mockReturnValue({ canReviewAiTestCases: true } as ReturnType<typeof useUserPermissions>);
    await update();
    await act(async () => {
      expect(await retained.pushToAgent?.()).toBe(false);
    });
    expect(state()).toMatchObject({ fixInProgress: true, canPush: false });
    expect(starts()).toHaveLength(1);
  });

  test('ignores a late terminal polling response after switching cases', async () => {
    await render();
    await push();
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    await tick();
    const signal = roundReads().at(-1)?.[1]?.signal as AbortSignal;
    await update({ testCaseId: 43 });
    expect(signal.aborted).toBe(true);
    await act(async () => {
      request.resolve({ status: 200, data: round('FIXED') });
      await flush();
    });
    expect(state().fixRoundState).toBeUndefined();
    expect(onFixCompleted).not.toHaveBeenCalled();
  });

  test('uses the latest completion callback without restarting an in-progress round', async () => {
    await render();
    await push();
    const nextCallback = jest.fn();
    await update({ onFixCompleted: nextCallback });
    serverRound = round('FIXED_GRADE_FAILED');
    serverReview = review({ comments: [], unsentCount: 0 });
    await tick();
    expect(onFixCompleted).not.toHaveBeenCalled();
    expect(nextCallback).toHaveBeenCalledTimes(1);
    expect(starts()).toHaveLength(1);
  });

  test('terminal grading feedback survives the refreshed version without completing twice', async () => {
    await render();
    await push();
    serverRound = round('FIXED_GRADE_FAILED');
    serverReview = review({ comments: [], unsentCount: 0 });
    await tick();
    expect(state()).toMatchObject({ fixCompleted: true, fixInProgress: false });
    await update({ versionId: 101 });
    expect(state()).toMatchObject({ fixCompleted: true, fixInProgress: false });
    expect(state().fixRoundState).toMatchObject({ id: 5, status: 'FIXED_GRADE_FAILED' });
    expect(onFixCompleted).toHaveBeenCalledTimes(1);
    expect(starts()).toHaveLength(1);
    await update({ testCaseId: 43 });
    expect(state().fixCompleted).toBe(false);
    expect(state().fixRoundState).toBeUndefined();
  });

  test('deduplicates the same terminal round after a version refresh while notifying for a different round', async () => {
    await render();
    await push();
    serverRound = round('FIXED');
    serverReview = review({ comments: [], unsentCount: 0 });
    await tick();
    expect(onFixCompleted).toHaveBeenCalledTimes(1);
    await update({ versionId: 101 });
    serverReview = review({
      unsentCount: 0,
      fixInProgress: true,
      fixRound: 1,
      comments: [{ ...comment, state: 'SENT', roundNumber: 1, fixRoundId: 5 }],
    });
    await act(async () => {
      state().reload();
      await flush();
    });
    serverReview = review({ comments: [], unsentCount: 0 });
    await tick();
    expect(state().fixRoundState).toMatchObject({ id: 5, status: 'FIXED' });
    expect(onFixCompleted).toHaveBeenCalledTimes(1);
    serverReview = review({
      unsentCount: 0,
      fixInProgress: true,
      fixRound: 2,
      comments: [{ ...comment, state: 'SENT', roundNumber: 2, fixRoundId: 8 }],
    });
    await act(async () => {
      state().reload();
      await flush();
    });
    serverRound = round('FIXED', { id: 8, roundNumber: 2 });
    serverReview = review({ comments: [], unsentCount: 0 });
    await tick();
    expect(state().fixRoundState).toMatchObject({ id: 8, status: 'FIXED' });
    expect(onFixCompleted).toHaveBeenCalledTimes(2);
    serverReview = review({
      unsentCount: 0,
      fixInProgress: true,
      fixRound: 1,
      comments: [{ ...comment, state: 'SENT', roundNumber: 1, fixRoundId: 5 }],
    });
    await act(async () => {
      state().reload();
      await flush();
    });
    serverRound = round('FIXED');
    serverReview = review({ comments: [], unsentCount: 0 });
    await tick();
    expect(state().fixRoundState).toMatchObject({ id: 5, status: 'FIXED' });
    expect(onFixCompleted).toHaveBeenCalledTimes(2);
    expect(starts()).toHaveLength(1);
  });

  test('a permission ABA during the start ignores stale results and retains an uncertain fixing lock', async () => {
    await render();
    const retained = state();
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    let start!: Promise<boolean> | undefined;
    await act(async () => {
      start = retained.pushToAgent?.();
      await flush();
    });
    jest
      .mocked(useUserPermissions)
      .mockReturnValue({ canReviewAiTestCases: false } as ReturnType<typeof useUserPermissions>);
    await update();
    jest
      .mocked(useUserPermissions)
      .mockReturnValue({ canReviewAiTestCases: true } as ReturnType<typeof useUserPermissions>);
    await update();
    await act(async () => {
      request.resolve({ status: 200, data: round() });
      expect(await start).toBe(false);
      await flush();
      expect(await retained.pushToAgent?.()).toBe(false);
    });
    expect(state()).toMatchObject({
      fixInProgress: true,
      canPush: false,
      fixStartError: 'UNCONFIRMED',
    });
    expect(state().fixRoundState).toBeUndefined();
    expect(starts()).toHaveLength(1);
  });

  test('unmount aborts a pending start and ignores its response', async () => {
    await render();
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    const retained = state();
    let start!: Promise<boolean> | undefined;
    await act(async () => {
      start = retained.pushToAgent?.();
      await flush();
    });
    const signal = starts()[0]?.[1]?.signal as AbortSignal;
    act(() => wrapper?.update().unmount());
    wrapper = undefined;
    expect(signal.aborted).toBe(true);
    await act(async () => {
      request.resolve({ status: 200, data: round() });
      expect(await start).toBe(false);
      expect(await retained.pushToAgent?.()).toBe(false);
      await flush();
    });
    expect(onFixCompleted).not.toHaveBeenCalled();
  });
});
