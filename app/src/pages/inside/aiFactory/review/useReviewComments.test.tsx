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
import { CommentState, CommentTargetType } from 'types/aiFactory';

import { useReviewComments } from './useReviewComments';
import type { ReviewCommentsLoadState } from './useReviewComments';

jest.mock('common/utils', () => ({
  ERROR_CANCELED: 'REQUEST_CANCELED',
  fetch: jest.fn(),
}));

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
>;

interface ProbeProps {
  enabled?: boolean;
  onState: (state: ReviewCommentsLoadState) => void;
}

const Probe = ({ enabled = true, onState }: ProbeProps) => {
  const state = useReviewComments('demo', 42, enabled);
  useEffect(() => onState(state), [onState, state]);
  return <div />;
};

const latestState = (onState: jest.Mock<void, [ReviewCommentsLoadState]>) => {
  const state = onState.mock.lastCall?.[0];
  if (!state) throw new Error('The review-comments hook did not report its state');
  return state;
};

describe('useReviewComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads comments and reloads after adding one', async () => {
    const onState = jest.fn<void, [ReviewCommentsLoadState]>();
    fetchMock
      .mockResolvedValueOnce([
        {
          id: 1,
          target: { type: CommentTargetType.PRECONDITION },
          text: 'Clarify it',
          author: { id: 1, name: 'Reviewer' },
          createdAt: 100,
          state: CommentState.PENDING,
          canDelete: true,
        },
        { malformed: true },
      ])
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce([]);

    await act(async () => {
      mount(<Probe onState={onState} />);
      await Promise.resolve();
    });

    expect(latestState(onState).comments).toHaveLength(1);

    await act(async () => {
      await latestState(onState).addComment({
        target: { type: CommentTargetType.PRECONDITION },
        text: 'Another comment',
      });
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/review-comment'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(latestState(onState).comments).toEqual([]);
  });

  test('does not request comments when the feature is disabled', () => {
    const onState = jest.fn<void, [ReviewCommentsLoadState]>();
    act(() => {
      mount(<Probe enabled={false} onState={onState} />);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(latestState(onState).isLoading).toBe(false);
  });
});
