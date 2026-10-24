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
import { idSelector, userIdSelector } from 'controllers/user';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { CommentTargetType } from 'types/aiFactory';

import { useLiveReviewComments } from './useLiveReviewComments';
import type { LiveReviewCommentsLoadState } from './useLiveReviewComments';

jest.mock('common/utils', () => ({ ERROR_CANCELED: 'REQUEST_CANCELED', fetch: jest.fn() }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('controllers/user', () => ({ idSelector: jest.fn(), userIdSelector: jest.fn() }));

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
>;
interface MountedWrapper extends ReactWrapper {
  update: () => MountedWrapper;
}
const ownComment = {
  id: 21,
  targetType: 'PRECONDITION',
  text: 'Clarify precondition',
  authorId: 12,
  createdAt: '2026-09-22T14:00:12Z',
  state: 'NOT_SENT',
};
const serverReview = (overrides: Record<string, unknown> = {}) => ({
  comments: [ownComment],
  unsentCount: 1,
  fixInProgress: false,
  ...overrides,
});
const payload = { target: { type: CommentTargetType.PRECONDITION }, text: '  Clarify it  ' };
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

interface ProbeProps {
  projectKey?: string;
  testCaseId?: number;
  enabled?: boolean;
  onState: (state: LiveReviewCommentsLoadState) => void;
}

const Probe = ({ projectKey = 'demo', testCaseId = 42, enabled = true, onState }: ProbeProps) => {
  const state = useLiveReviewComments(projectKey, testCaseId, enabled);
  useEffect(() => onState(state), [state, onState]);
  return <div />;
};

const latest = (onState: jest.Mock<void, [LiveReviewCommentsLoadState]>) => {
  const state = onState.mock.lastCall?.[0];
  if (!state) throw new Error('Live review hook has not reported a state');
  return state;
};

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('useLiveReviewComments', () => {
  let wrapper: MountedWrapper | undefined;
  let onState: jest.Mock<void, [LiveReviewCommentsLoadState]>;

  const render = async (props: Partial<ProbeProps> = {}) => {
    await act(async () => {
      wrapper = mount(<Probe onState={onState} {...props} />) as MountedWrapper;
      await flush();
    });
    wrapper?.update();
  };
  const update = async (props: Partial<ProbeProps>) => {
    await act(async () => {
      wrapper?.setProps(props);
      await flush();
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
    onState = jest.fn<void, [LiveReviewCommentsLoadState]>();
    jest.mocked(useSelector).mockImplementation((selector) => {
      if (selector === idSelector) return 12;
      if (selector === userIdSelector) return 'reviewer-login';
      return undefined;
    });
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: true,
    } as ReturnType<typeof useUserPermissions>);
  });

  afterEach(() => {
    act(() => wrapper?.update().unmount());
    wrapper = undefined;
  });

  test('exposes initial loading, reads the native envelope and trusts server unsentCount', async () => {
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    await render();

    expect(latest(onState)).toMatchObject({ isLoading: true, isError: false, comments: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/tms\/test-case\/42\/review$/),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    await act(async () => {
      request.resolve(serverReview({ unsentCount: 7 }));
      await flush();
    });

    expect(latest(onState)).toMatchObject({
      isLoading: false,
      isError: false,
      isLoaded: true,
      unsentCount: 7,
    });
    expect(latest(onState).comments[0]).toMatchObject({ author: { id: 12 }, canDelete: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test.each([null, [], { comments: [], unsentCount: 0 }])(
    'reports malformed Review as an error and retries: %j',
    async (response) => {
      fetchMock
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce(serverReview({ comments: [], unsentCount: 0 }));
      await render();
      expect(latest(onState)).toMatchObject({ isLoading: false, isError: true });

      await act(async () => {
        latest(onState).reload();
        await flush();
      });

      expect(latest(onState)).toMatchObject({
        isLoading: false,
        isError: false,
        isLoaded: true,
        comments: [],
        unsentCount: 0,
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );

  test('reports network failure and recovers through reload', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce(serverReview());
    await render();
    expect(latest(onState).isError).toBe(true);

    await act(async () => {
      latest(onState).reload();
      await flush();
    });
    expect(latest(onState)).toMatchObject({ isError: false, isLoaded: true });
  });

  test.each([{ enabled: false }, { projectKey: '' }, { testCaseId: 0 }])(
    'makes no reads or mutations for invalid or disabled resource: %j',
    async (props) => {
      await render(props);
      await act(async () => {
        await latest(onState).addComment(payload);
        await latest(onState).deleteComment(21);
        await latest(onState).discardPending();
      });

      expect(fetchMock).not.toHaveBeenCalled();
      expect(latest(onState)).toMatchObject({ isLoading: false, isMutating: false });
    },
  );

  test('viewer can read comments without mutating them', async () => {
    jest
      .mocked(useUserPermissions)
      .mockReturnValue({ canReviewAiTestCases: false } as ReturnType<typeof useUserPermissions>);
    fetchMock.mockResolvedValueOnce(serverReview());
    await render();

    await act(async () => {
      await latest(onState).addComment(payload);
      await latest(onState).deleteComment(21);
      await latest(onState).discardPending();
    });

    expect(latest(onState).comments).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('posts only the native request body then reconciles Review', async () => {
    fetchMock
      .mockResolvedValueOnce(serverReview())
      .mockResolvedValueOnce({ ...ownComment, id: 22 })
      .mockResolvedValueOnce(serverReview({ unsentCount: 2 }));
    await render();
    await act(async () => {
      await latest(onState).addComment(payload);
      await flush();
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/review\/comment$/),
      expect.objectContaining({
        method: 'POST',
        data: { targetType: 'PRECONDITION', text: 'Clarify it' },
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(/\/review$/),
      expect.any(Object),
    );
    expect(latest(onState).unsentCount).toBe(2);
  });

  test('deletes only own unsent comment and discards via native path without legacy query', async () => {
    fetchMock
      .mockResolvedValueOnce(serverReview())
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(serverReview())
      .mockResolvedValueOnce(serverReview({ comments: [], unsentCount: 0 }))
      .mockResolvedValueOnce(serverReview({ comments: [], unsentCount: 0 }));
    await render();
    await act(async () => {
      await latest(onState).deleteComment(21);
      await flush();
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/review\/comment\/21$/),
      expect.objectContaining({ method: 'DELETE' }),
    );

    await act(async () => {
      await latest(onState).discardPending();
      await flush();
    });
    expect(
      fetchMock.mock.calls.some(
        ([url, params]) => /\/review\/comment$/.test(url) && params?.method === 'DELETE',
      ),
    ).toBe(true);
    expect(fetchMock.mock.calls.every(([url]) => !url.includes('?'))).toBe(true);
    expect(latest(onState)).toMatchObject({ comments: [], unsentCount: 0 });
  });

  test('blocks deleting other authors, sent comments and unknown comment IDs', async () => {
    fetchMock.mockResolvedValueOnce(
      serverReview({
        comments: [
          { ...ownComment, authorId: 99 },
          { ...ownComment, id: 22, state: 'SENT' },
        ],
      }),
    );
    await render();
    await act(async () => {
      await latest(onState).deleteComment(21);
      await latest(onState).deleteComment(22);
      await latest(onState).deleteComment(999);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('blocks every mutation while the server reports fixing without polling', async () => {
    fetchMock.mockResolvedValueOnce(serverReview({ fixInProgress: true }));
    await render();
    await act(async () => {
      await latest(onState).addComment(payload);
      await latest(onState).deleteComment(21);
      await latest(onState).discardPending();
    });
    expect(latest(onState).fixInProgress).toBe(true);
    expect(latest(onState).fixRound).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('guards duplicate POST calls synchronously before React rerenders', async () => {
    const mutation = deferred<unknown>();
    fetchMock
      .mockResolvedValueOnce(serverReview())
      .mockReturnValueOnce(mutation.promise)
      .mockResolvedValueOnce(serverReview());
    await render();
    const add = latest(onState).addComment;
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    act(() => {
      first = add(payload);
      second = add(payload);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      mutation.resolve(ownComment);
      await Promise.all([first, second]);
      await flush();
    });
    expect(await second).toBe(false);
    expect(fetchMock.mock.calls.filter(([, params]) => params?.method === 'POST')).toHaveLength(1);
  });

  test.each([
    { errorCode: 40915, message: 'Test case review conflict', status: 409 },
    new Error('Network disconnected'),
  ])('reconciles authoritative Review after failed mutation: %j', async (error) => {
    fetchMock
      .mockResolvedValueOnce(serverReview())
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(serverReview({ fixInProgress: true }));
    await render();
    await act(async () => {
      await latest(onState)
        .addComment(payload)
        .catch(() => false);
      await flush();
    });
    expect(latest(onState)).toMatchObject({
      isMutating: false,
      isMutationError: true,
      fixInProgress: true,
    });
    expect(fetchMock.mock.calls.filter(([url]) => /\/review$/.test(url))).toHaveLength(2);
  });

  test('ignores stale GET after a project change even when cancellation is not honored', async () => {
    const old = deferred<unknown>();
    fetchMock
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(serverReview({ unsentCount: 8 }));
    await render();
    await update({ projectKey: 'other' });
    await act(async () => {
      old.resolve(serverReview({ unsentCount: 99 }));
      await flush();
    });

    expect(latest(onState).unsentCount).toBe(8);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('does not accept the first A response after A to B to A navigation', async () => {
    const firstA = deferred<unknown>();
    fetchMock
      .mockReturnValueOnce(firstA.promise)
      .mockResolvedValueOnce(serverReview({ unsentCount: 2 }))
      .mockResolvedValueOnce(serverReview({ unsentCount: 3 }));
    await render();
    await update({ testCaseId: 43 });
    await update({ testCaseId: 42 });
    await act(async () => {
      firstA.resolve(serverReview({ unsentCount: 99 }));
      await flush();
    });

    expect(latest(onState).unsentCount).toBe(3);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test.each(['project', 'case', 'disable', 'unmount', 'return-to-A'] as const)(
    'ignores old mutation completion after %s navigation',
    async (navigation) => {
      const mutation = deferred<unknown>();
      fetchMock
        .mockResolvedValueOnce(serverReview())
        .mockReturnValueOnce(mutation.promise)
        .mockResolvedValue(serverReview({ unsentCount: 8 }));
      await render();
      let result!: Promise<boolean>;
      act(() => {
        result = latest(onState).addComment(payload);
      });
      if (navigation === 'unmount') {
        act(() => wrapper?.update().unmount());
        wrapper = undefined;
      } else if (navigation === 'project') {
        await update({ projectKey: 'other' });
      } else if (navigation === 'disable') {
        await update({ enabled: false });
      } else {
        await update({ testCaseId: 43 });
        if (navigation === 'return-to-A') await update({ testCaseId: 42 });
      }
      const callsBeforeCompletion = fetchMock.mock.calls.length;
      await act(async () => {
        mutation.resolve(ownComment);
        await result;
        await flush();
      });

      expect(await result).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(callsBeforeCompletion);
      if (navigation !== 'unmount' && navigation !== 'disable') {
        expect(latest(onState)).toMatchObject({ unsentCount: 8, isMutating: false });
      }
    },
  );

  test('ignores GET completion after disable and requests fresh data when reenabled', async () => {
    const request = deferred<unknown>();
    fetchMock
      .mockReturnValueOnce(request.promise)
      .mockResolvedValueOnce(serverReview({ unsentCount: 8 }));
    await render();
    await update({ enabled: false });
    await act(async () => {
      request.resolve(serverReview({ unsentCount: 99 }));
      await flush();
    });
    expect(latest(onState)).toMatchObject({ comments: [], isLoading: false });
    await update({ enabled: true });
    expect(latest(onState).unsentCount).toBe(8);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('does not allow a retained mutation callback after review permission is revoked', async () => {
    fetchMock.mockResolvedValueOnce(serverReview());
    await render();
    const add = latest(onState).addComment;
    jest
      .mocked(useUserPermissions)
      .mockReturnValue({ canReviewAiTestCases: false } as ReturnType<typeof useUserPermissions>);
    await update({ enabled: true });
    await act(async () => {
      await add(payload);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('a stale mutation cannot release the next case mutation lock', async () => {
    const mutationA = deferred<unknown>();
    const mutationB = deferred<unknown>();
    fetchMock
      .mockResolvedValueOnce(serverReview())
      .mockReturnValueOnce(mutationA.promise)
      .mockResolvedValueOnce(serverReview())
      .mockReturnValueOnce(mutationB.promise)
      .mockResolvedValueOnce(serverReview());
    await render();
    let resultA!: Promise<boolean>;
    let resultB!: Promise<boolean>;
    act(() => {
      resultA = latest(onState).addComment(payload);
    });
    await update({ testCaseId: 43 });
    act(() => {
      resultB = latest(onState).addComment(payload);
    });
    expect(latest(onState).isMutating).toBe(true);
    await act(async () => {
      mutationA.resolve(ownComment);
      await resultA;
      await flush();
    });
    expect(latest(onState).isMutating).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    await act(async () => {
      mutationB.resolve(ownComment);
      await resultB;
      await flush();
    });
    expect(latest(onState).isMutating).toBe(false);
    expect(await resultA).toBe(false);
    expect(await resultB).toBe(true);
  });

  test('does not publish GET results after unmount', async () => {
    const request = deferred<unknown>();
    fetchMock.mockReturnValueOnce(request.promise);
    await render();
    act(() => {
      wrapper?.update().unmount();
    });
    wrapper = undefined;
    const reportsBeforeCompletion = onState.mock.calls.length;
    await act(async () => {
      request.resolve(serverReview());
      await flush();
    });
    expect(onState).toHaveBeenCalledTimes(reportsBeforeCompletion);
  });

  test.each(['delete', 'discard'] as const)(
    'reconciles the review after failed %s mutation',
    async (operation) => {
      fetchMock
        .mockResolvedValueOnce(serverReview())
        .mockRejectedValueOnce({ errorCode: 40915 })
        .mockResolvedValueOnce(serverReview({ comments: [], unsentCount: 0, fixInProgress: true }));
      await render();
      await act(async () => {
        await (
          operation === 'delete'
            ? latest(onState).deleteComment(21)
            : latest(onState).discardPending()
        ).catch(() => false);
        await flush();
      });
      expect(latest(onState)).toMatchObject({
        isMutationError: true,
        fixInProgress: true,
        unsentCount: 0,
        comments: [],
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    },
  );

  test('retains known fixing lock after a refresh fails while marking the Review unavailable', async () => {
    fetchMock
      .mockResolvedValueOnce(serverReview({ fixInProgress: true }))
      .mockRejectedValueOnce(new Error('Offline'));
    await render();
    await act(async () => {
      latest(onState).reload();
      await flush();
    });
    expect(latest(onState)).toMatchObject({ isError: true, isLoaded: false, fixInProgress: true });
    expect(latest(onState).comments).toHaveLength(1);
    await act(async () => {
      await latest(onState).addComment(payload);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('rejects an in-flight read immediately after Refresh and accepts only its replacement', async () => {
    const initial = deferred<unknown>();
    const replacement = deferred<unknown>();
    fetchMock.mockReturnValueOnce(initial.promise).mockReturnValueOnce(replacement.promise);
    await render();
    await act(async () => {
      latest(onState).reload();
      initial.resolve(serverReview({ unsentCount: 99 }));
      await flush();
    });
    expect(latest(onState).isLoading).toBe(true);
    expect(latest(onState).unsentCount).toBe(0);
    await act(async () => {
      replacement.resolve(serverReview({ unsentCount: 8 }));
      await flush();
    });
    expect(latest(onState).unsentCount).toBe(8);
  });
});
