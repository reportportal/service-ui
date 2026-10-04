/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { act, type ChangeEvent } from 'react';
import { shallow } from 'enzyme';

import { CommentState, CommentTargetType, FixRoundStatus, Lifecycle } from 'types/aiFactory';
import type { ReviewCommentRS } from 'types/aiFactory';

import { ReviewStrip, ReviewTarget } from './reviewComments';
import type { ReviewCommentsLoadState } from './useReviewComments';
import type { FixRoundLoadState } from './useFixRound';

jest.mock('@reportportal/ui-kit', () => ({
  BubblesLoader: () => <span>BubblesLoader</span>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  DeleteIcon: () => <span>DeleteIcon</span>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('common/img/comment-inline.svg', () => 'comment.svg');
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: Array<string | Record<string, boolean>>) =>
      classNames
        .flatMap((className) =>
          typeof className === 'string'
            ? className
            : Object.entries(className)
                .filter(([, enabled]) => enabled)
                .map(([name]) => name),
        )
        .join(' '),
}));
jest.mock('common/utils/timeDateUtils', () => ({ fromNowFormat: () => 'a moment ago' }));
jest.mock('pages/inside/aiFactory/common', () => ({ LifecycleBadge: 'LifecycleBadge' }));
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);

const comments: ReviewCommentRS[] = [
  {
    id: 1,
    target: { type: CommentTargetType.STEP, stepId: 7 },
    text: 'Use the Library label',
    author: { id: 1, name: 'Reviewer' },
    createdAt: 100,
    state: CommentState.PENDING,
    canDelete: true,
  },
  {
    id: 3,
    target: { type: CommentTargetType.STEP, stepId: 7 },
    text: 'Keep this label',
    author: { id: 2, name: 'Other' },
    createdAt: 300,
    state: CommentState.NOT_ADDRESSED,
    fixRound: 2,
    reason: 'The source requirement uses the original name',
    canDelete: false,
  },
  {
    id: 2,
    target: { type: CommentTargetType.STEP, stepId: 8 },
    text: 'Different step',
    author: { id: 2, name: 'Other' },
    createdAt: 200,
    state: CommentState.ADDRESSED,
    fixRound: 1,
    canDelete: false,
  },
];

const createReviewState = (
  overrides: Partial<ReviewCommentsLoadState> = {},
): ReviewCommentsLoadState => ({
  comments,
  isLoading: false,
  isError: false,
  isMutating: false,
  reload: jest.fn(),
  addComment: jest.fn(() => Promise.resolve()),
  deleteComment: jest.fn(() => Promise.resolve()),
  discardPending: jest.fn(() => Promise.resolve()),
  ...overrides,
});

const createFixRoundState = (overrides: Partial<FixRoundLoadState> = {}): FixRoundLoadState => ({
  current: null,
  isLoading: false,
  isStarting: false,
  isError: false,
  start: jest.fn(() => Promise.resolve()),
  reload: jest.fn(),
  ...overrides,
});

describe('AI review comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows only the selected target thread and adds trimmed text', async () => {
    const reviewState = createReviewState();
    const wrapper = shallow(
      <ReviewTarget
        target={{ type: CommentTargetType.STEP, stepId: 7 }}
        reviewState={reviewState}
      />,
    );

    const openThread = wrapper
      .find('[data-automation-id="review-comment-toggle-STEP-7"]')
      .prop('onClick') as () => void;
    const trigger = wrapper.find('[data-automation-id="review-comment-toggle-STEP-7"]');
    const threadId = trigger.prop('aria-controls');
    expect(trigger.prop('aria-expanded')).toBe(false);
    openThread();
    expect(wrapper.find('[data-automation-id="review-comment-toggle-STEP-7"]').prop('aria-expanded')).toBe(
      true,
    );
    const thread = wrapper.find('[role="region"]');
    expect(thread.props()).toMatchObject({
      id: threadId,
      role: 'region',
      'aria-labelledby': trigger.prop('id'),
    });
    expect(wrapper.text()).toContain('Use the Library label');
    expect(wrapper.text()).toContain('The source requirement uses the original name');
    expect(wrapper.text()).not.toContain('Different step');

    const onChange = wrapper.find('textarea').prop('onChange') as (
      event: ChangeEvent<HTMLTextAreaElement>,
    ) => void;
    onChange({ target: { value: '  Clarify this step  ' } } as ChangeEvent<HTMLTextAreaElement>);
    await act(async () => {
      const addComment = wrapper
        .find('[data-automation-id="add-review-comment"]')
        .prop('onClick') as () => void;
      addComment();
      await Promise.resolve();
    });

    expect(reviewState.addComment).toHaveBeenCalledWith({
      target: { type: CommentTargetType.STEP, stepId: 7 },
      text: 'Clarify this step',
    });
  });

  test('makes an open thread read-only while a fix is running', () => {
    const wrapper = shallow(
      <ReviewTarget
        target={{ type: CommentTargetType.STEP, stepId: 7 }}
        reviewState={createReviewState()}
        isReadOnly
      />,
    );

    const openThread = wrapper
      .find('[data-automation-id="review-comment-toggle-STEP-7"]')
      .prop('onClick') as () => void;
    openThread();

    expect(wrapper.find('textarea')).toHaveLength(0);
    expect(wrapper.find('[aria-label="Delete comment"]')).toHaveLength(0);
  });

  test('discards pending comments only after confirmation', async () => {
    const reviewState = createReviewState();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const wrapper = shallow(
      <ReviewStrip
        lifecycle={Lifecycle.DRAFT}
        reviewState={reviewState}
        fixRoundState={createFixRoundState()}
      />,
    );

    await act(async () => {
      const discard = wrapper
        .find('[data-automation-id="discard-review-comments"]')
        .prop('onClick') as () => void;
      discard();
      await Promise.resolve();
    });

    expect(window.confirm).toHaveBeenCalledWith('Discard all unsent review comments?');
    expect(reviewState.discardPending).toHaveBeenCalledTimes(1);
  });

  test('offers retry when loading comments fails', () => {
    const reviewState = createReviewState({ comments: [], isError: true });
    const wrapper = shallow(
      <ReviewStrip
        lifecycle={Lifecycle.READY}
        reviewState={reviewState}
        fixRoundState={createFixRoundState()}
      />,
    );

    const retry = wrapper
      .find('[data-automation-id="retry-review-comments"]')
      .prop('onClick') as () => void;
    retry();

    expect(reviewState.reload).toHaveBeenCalledTimes(1);
  });

  test('shows the locked state while a fix round is running', () => {
    const fixRoundState = createFixRoundState({
      current: {
        round: 3,
        testCaseId: 42,
        displayId: 'TC106',
        status: FixRoundStatus.RUNNING,
        pushedBy: 'Reviewer',
        pushedAt: 100,
        commentsCount: 1,
      },
    });
    const wrapper = shallow(
      <ReviewStrip
        lifecycle={Lifecycle.DRAFT}
        reviewState={createReviewState()}
        isReadOnly
        readOnlyReason="FIX_RUNNING"
        fixRoundState={fixRoundState}
      />,
    );

    expect(wrapper.find('output').text()).toContain('Agent is fixing');
    expect(wrapper.find('[data-automation-id="push-review-comments"]').prop('disabled')).toBe(true);
  });

  test('does not expose Discard after a failed fix round in read-only mode', () => {
    const wrapper = shallow(
      <ReviewStrip
        lifecycle={Lifecycle.DRAFT}
        reviewState={createReviewState()}
        isReadOnly
        readOnlyReason="NO_PERMISSION"
        fixRoundState={createFixRoundState({
          current: {
            round: 3,
            testCaseId: 42,
            displayId: 'TC106',
            status: FixRoundStatus.FAILED,
            pushedBy: 'Reviewer',
            pushedAt: 100,
            commentsCount: 1,
          },
        })}
      />,
    );

    expect(wrapper.find('Button[variant="text-danger"]')).toHaveLength(0);
    expect(wrapper.find('[data-automation-id="push-review-comments-again"]')).toHaveLength(0);
  });
});
