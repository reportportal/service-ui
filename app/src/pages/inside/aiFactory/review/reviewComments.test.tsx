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
import { useDispatch } from 'react-redux';
import { mount, shallow, type ReactWrapper } from 'enzyme';

import { showModalAction } from 'controllers/modal';
import { CommentState, CommentTargetType, FixRoundStatus, Lifecycle } from 'types/aiFactory';
import type { ReviewCommentRS } from 'types/aiFactory';

import { ReviewStrip, ReviewTarget } from './reviewComments';
import { LiveReviewStrip } from './liveReviewStrip';
import type { LiveReviewCommentsLoadState } from './useLiveReviewComments';
import type { ReviewCommentsLoadState } from './useReviewComments';
import type { FixRoundLoadState } from './useFixRound';

jest.mock('@reportportal/ui-kit', () => ({
  BubblesLoader: () => <span>BubblesLoader</span>,
  Button: ({
    children,
    disabled,
    onClick,
    'data-automation-id': automationId,
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { 'data-automation-id'?: string }) => (
    <button type="button" disabled={disabled} onClick={onClick} data-automation-id={automationId}>
      {children}
    </button>
  ),
  DeleteIcon: () => <span>DeleteIcon</span>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('react-redux', () => ({ useDispatch: jest.fn() }));
jest.mock('controllers/modal', () => ({
  showModalAction: jest.fn((payload: unknown) => ({ type: 'SHOW_MODAL', payload })),
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
jest.mock('pages/inside/aiFactory/common', () => ({
  LifecycleBadge: ({ lifecycle }: { lifecycle: string }) => <span>{lifecycle}</span>,
}));
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
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useDispatch).mockReturnValue(dispatch);
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
    expect(
      wrapper.find('[data-automation-id="review-comment-toggle-STEP-7"]').prop('aria-expanded'),
    ).toBe(true);
    const thread = wrapper.find('section');
    expect(thread.props()).toMatchObject({
      id: threadId,
      'aria-labelledby': trigger.prop('id'),
    });
    expect(thread.prop('role')).toBeUndefined();
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

  test('can expose the precondition composer initially for the review design', () => {
    const wrapper = shallow(
      <ReviewTarget
        target={{ type: CommentTargetType.PRECONDITION }}
        reviewState={createReviewState({ comments: [] })}
        isInitiallyOpen
      />,
    );

    expect(wrapper.find('section')).toHaveLength(1);
    expect(wrapper.text()).toContain('No review comments yet');
    expect(wrapper.find('textarea').prop('placeholder')).toBe('What should the agent change here?');
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
    const wrapper = shallow(
      <ReviewStrip
        lifecycle={Lifecycle.DRAFT}
        reviewState={reviewState}
        fixRoundState={createFixRoundState()}
      />,
    );

    const discard = wrapper
      .find('[data-automation-id="discard-review-comments"]')
      .prop('onClick') as () => void;
    discard();

    expect(showModalAction).toHaveBeenCalledWith({
      id: 'confirmationModal',
      data: expect.objectContaining({
        title: 'Discard comments',
        message: 'Discard all unsent review comments?',
        dangerConfirm: true,
        onConfirm: expect.any(Function),
      }),
    });
    expect(reviewState.discardPending).not.toHaveBeenCalled();

    const modalPayload = jest.mocked(showModalAction).mock.calls[0][0] as {
      data: { onConfirm: () => void };
    };
    await act(async () => {
      modalPayload.data.onConfirm();
      await Promise.resolve();
    });

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

const createLiveReviewState = (
  overrides: Partial<LiveReviewCommentsLoadState> = {},
): LiveReviewCommentsLoadState => ({
  resourceKey: {},
  comments: [],
  unsentCount: 0,
  fixInProgress: false,
  isLoaded: true,
  isLoading: false,
  isError: false,
  isMutating: false,
  isMutationError: false,
  reload: jest.fn(),
  addComment: jest.fn(() => Promise.resolve(true)),
  deleteComment: jest.fn(() => Promise.resolve(true)),
  discardPending: jest.fn(() => Promise.resolve(true)),
  ...overrides,
});

const changeComposer = (wrapper: ReturnType<typeof shallow>, text: string) => {
  const onChange = wrapper.find('textarea').prop('onChange') as (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onChange({ target: { value: text } } as ChangeEvent<HTMLTextAreaElement>);
};

const submitComposer = (wrapper: ReturnType<typeof shallow>) => {
  const onClick = wrapper
    .find('[data-automation-id="add-review-comment"]')
    .prop('onClick') as () => void;
  onClick();
};

const stripFeedback = (wrapper: ReactWrapper) =>
  [wrapper.find('output'), wrapper.find('[role="alert"]')]
    .map((node) => (node.length === 1 ? node.prop('children') : undefined))
    .flat()
    .filter((child): child is string => typeof child === 'string')
    .join(' ');

describe('native AI review presentation', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows the authoritative unsent count without claiming approval', () => {
    const wrapper = shallow(
      <LiveReviewStrip
        lifecycle={Lifecycle.READY}
        reviewState={createLiveReviewState({ unsentCount: 7 })}
        isReadOnly={false}
      />,
    );

    expect(wrapper.text()).toContain('7 not sent');
    expect(wrapper.find('[data-automation-id="discard-review-comments"]')).toHaveLength(1);
    expect(wrapper.text()).not.toContain('Approve');
  });

  test.each([Lifecycle.DRAFT, Lifecycle.READY])(
    'an editor can push native %s review and sees the authoritative comment count',
    async (lifecycle) => {
      const state = createLiveReviewState({
        unsentCount: 7,
        canPush: true,
        pushToAgent: jest.fn(() => Promise.resolve(true)),
      });
      const wrapper = mount(
        <LiveReviewStrip lifecycle={lifecycle} reviewState={state} isReadOnly={false} />,
      );
      const push = wrapper.find('button[data-automation-id="push-review-comments"]');
      expect(push.prop('children')).toBe('Push to agent · 7');
      expect(push.prop('disabled')).toBe(false);
      await act(async () => {
        (push.prop('onClick') as () => void)();
        await Promise.resolve();
      });
      expect(state.pushToAgent).toHaveBeenCalledTimes(1);
      expect(state.discardPending).not.toHaveBeenCalled();
      wrapper.unmount();
    },
  );

  test('a viewer can read fix status and retry monitoring without seeing Push', () => {
    const state = createLiveReviewState({
      unsentCount: 7,
      fixInProgress: true,
      fixMonitoringError: 'READ',
      retryFixMonitoring: jest.fn(),
    });
    const wrapper = mount(<LiveReviewStrip reviewState={state} isReadOnly />);
    expect(wrapper.find('button[data-automation-id="push-review-comments"]')).toHaveLength(0);
    expect(wrapper.find('button[data-automation-id="discard-review-comments"]')).toHaveLength(0);
    (
      wrapper
        .find('button[data-automation-id="retry-fix-monitoring"]')
        .prop('onClick') as () => void
    )();
    expect(state.retryFixMonitoring).toHaveBeenCalledTimes(1);
    expect(stripFeedback(wrapper)).toContain('Agent is fixing');
    expect(state.pushToAgent).toBeUndefined();
    wrapper.unmount();
  });

  test.each([
    { isLoading: true, isLoaded: false },
    { isMutating: true },
    { fixInProgress: true },
    { isError: true, isLoaded: false },
  ])('keeps Push disabled while the hook disallows a command: %j', (overrides) => {
    const state = createLiveReviewState({ unsentCount: 2, canPush: false, ...overrides });
    const wrapper = mount(<LiveReviewStrip reviewState={state} isReadOnly={false} />);
    expect(wrapper.find('button[data-automation-id="push-review-comments"]').prop('disabled')).toBe(
      true,
    );
    wrapper.unmount();
  });

  test.each([
    ['FIXED', 'Fix round 1 finished.'],
    ['FIXED_GRADE_FAILED', 'grading failed'],
    ['FAILED', 'Fix round 1 failed.'],
  ] as const)(
    'presents terminal %s without claiming Auto-Ready or reusing grade metrics',
    (status, text) => {
      const state = createLiveReviewState({
        fixCompleted: true,
        fixRoundState: { id: 5, testCaseId: 42, roundNumber: 1, status },
      });
      const wrapper = mount(<LiveReviewStrip reviewState={state} isReadOnly />);
      expect(stripFeedback(wrapper)).toContain(text);
      expect(stripFeedback(wrapper)).not.toMatch(/Auto-Ready|score|93/);
      expect(wrapper.find('button[data-automation-id="retry-fix-monitoring"]')).toHaveLength(0);
      wrapper.unmount();
    },
  );

  test('withdraws an old terminal summary when a new external fix is observed', () => {
    const wrapper = mount(
      <LiveReviewStrip
        reviewState={createLiveReviewState({
          fixCompleted: true,
          fixRoundState: { id: 5, testCaseId: 42, roundNumber: 1, status: 'FIXED' },
        })}
        isReadOnly
      />,
    );
    expect(stripFeedback(wrapper)).toContain('Fix round 1 finished.');
    wrapper.setProps({
      reviewState: createLiveReviewState({
        fixCompleted: false,
        fixInProgress: true,
        fixRound: 2,
      }),
    });
    expect(stripFeedback(wrapper)).toContain('Fix round 2');
    expect(stripFeedback(wrapper)).not.toContain('finished');
    wrapper.unmount();
  });

  test('presents Review-only completion without fabricating a successful round', () => {
    const wrapper = mount(
      <LiveReviewStrip reviewState={createLiveReviewState({ fixCompleted: true })} isReadOnly />,
    );
    expect(stripFeedback(wrapper)).toContain('The fix is no longer in progress');
    expect(stripFeedback(wrapper)).not.toMatch(/Fix round 1|Auto-Ready|grading failed/);
    wrapper.unmount();
  });

  test.each([
    ['CONFLICT', 'changed or a fix is already in progress'],
    ['FAILED', 'could not be started'],
    ['UNCONFIRMED', 'start could not be confirmed'],
  ] as const)(
    'distinguishes the %s start outcome from a FAILED agent result',
    (fixStartError, text) => {
      const wrapper = mount(
        <LiveReviewStrip reviewState={createLiveReviewState({ fixStartError })} isReadOnly />,
      );
      expect(stripFeedback(wrapper)).toContain(text);
      expect(stripFeedback(wrapper)).not.toContain('Fix round 1 failed');
      wrapper.unmount();
    },
  );

  test.each(['READ', 'TIMEOUT', 'MISSING'] as const)(
    'offers only read monitoring retry for %s without dispatching Push',
    (fixMonitoringError) => {
      const state = createLiveReviewState({
        fixMonitoringError,
        retryFixMonitoring: jest.fn(),
        pushToAgent: jest.fn(() => Promise.resolve(false)),
      });
      const wrapper = mount(<LiveReviewStrip reviewState={state} isReadOnly />);
      (
        wrapper
          .find('button[data-automation-id="retry-fix-monitoring"]')
          .prop('onClick') as () => void
      )();
      expect(state.retryFixMonitoring).toHaveBeenCalledTimes(1);
      expect(state.pushToAgent).not.toHaveBeenCalled();
      wrapper.unmount();
    },
  );

  test('shows a fixing message without inventing a round and wires explicit Refresh', () => {
    const state = createLiveReviewState({ fixInProgress: true, unsentCount: 2 });
    const wrapper = shallow(
      <LiveReviewStrip lifecycle={Lifecycle.DRAFT} reviewState={state} isReadOnly />,
    );

    expect(wrapper.find('output').text()).toContain('Agent is fixing');
    expect(wrapper.find('output').text()).not.toMatch(/round\s*1/i);
    expect(wrapper.find('[data-automation-id="discard-review-comments"]')).toHaveLength(0);
    const refresh = wrapper
      .find('[data-automation-id="refresh-review-comments"]')
      .prop('onClick') as () => void;
    refresh();
    expect(state.reload).toHaveBeenCalledTimes(1);
  });

  test.each([Lifecycle.DRAFT, Lifecycle.READY])(
    'keeps an empty %s review actionable without a fabricated pending count',
    (lifecycle) => {
      const wrapper = shallow(
        <LiveReviewStrip
          lifecycle={lifecycle}
          reviewState={createLiveReviewState()}
          isReadOnly={false}
        />,
      );
      expect(wrapper.text()).toContain('0 not sent');
      expect(wrapper.find('[data-automation-id="discard-review-comments"]')).toHaveLength(0);
      expect(wrapper.find('[data-automation-id="refresh-review-comments"]').prop('disabled')).toBe(
        false,
      );
    },
  );

  test('does not display zero as authoritative while Review is loading', () => {
    const wrapper = shallow(
      <LiveReviewStrip
        lifecycle={Lifecycle.DRAFT}
        reviewState={createLiveReviewState({ isLoading: true, isLoaded: false })}
        isReadOnly
      />,
    );
    expect(wrapper.find('BubblesLoader')).toHaveLength(1);
    expect(wrapper.text()).not.toContain('0 not sent');
  });

  test('shows load and mutation failures and permits explicit reload after failure', () => {
    const state = createLiveReviewState({ isLoaded: false, isError: true, isMutationError: true });
    const wrapper = shallow(<LiveReviewStrip reviewState={state} isReadOnly />);
    expect(wrapper.find('[role="alert"]')).toHaveLength(2);
    expect(wrapper.find('[data-automation-id="refresh-review-comments"]').prop('disabled')).toBe(
      false,
    );
  });

  test('confirms native discard before calling its mutation', async () => {
    const state = createLiveReviewState({ unsentCount: 2 });
    const wrapper = shallow(<LiveReviewStrip reviewState={state} isReadOnly={false} />);
    const discard = wrapper
      .find('[data-automation-id="discard-review-comments"]')
      .prop('onClick') as () => void;
    discard();
    expect(state.discardPending).not.toHaveBeenCalled();
    const modal = jest.mocked(showModalAction).mock.lastCall?.[0] as {
      data: { onConfirm: () => void };
    };
    await act(async () => {
      modal.data.onConfirm();
      await Promise.resolve();
    });
    expect(state.discardPending).toHaveBeenCalledTimes(1);
  });

  test('matches native step numbers independently of legacy step database IDs', () => {
    const state = createLiveReviewState({
      comments: [
        {
          ...comments[0],
          target: { type: CommentTargetType.STEP, stepNumber: 2 },
          author: { id: 12 },
        },
        { ...comments[1], target: { type: CommentTargetType.STEP, stepId: 2 } },
      ],
    });
    const wrapper = shallow(
      <ReviewTarget
        target={{ type: CommentTargetType.STEP, stepNumber: 2 }}
        reviewState={state}
        isInitiallyOpen
      />,
    );

    expect(wrapper.text()).toContain('Use the Library label');
    expect(wrapper.text()).not.toContain('Keep this label');
    expect(wrapper.text()).toContain('User 12');
    expect(wrapper.text()).not.toContain('Reviewer');
  });

  test.each([
    new Error('Unavailable'),
    Object.assign(new Error('Review conflict'), { status: 409, errorCode: 40915 }),
  ])('retains composer text and shows feedback after rejected add: %j', async (error) => {
    const state = createLiveReviewState({ addComment: jest.fn(() => Promise.reject(error)) });
    const wrapper = shallow(
      <ReviewTarget
        target={{ type: CommentTargetType.TEXT_SCENARIO }}
        reviewState={state}
        isInitiallyOpen
      />,
    );
    changeComposer(wrapper, '  Keep this draft  ');
    await act(async () => {
      submitComposer(wrapper);
      await Promise.resolve();
    });

    expect(wrapper.find('textarea').prop('value')).toBe('  Keep this draft  ');
    expect(wrapper.find('[role="alert"]')).toHaveLength(1);
    expect(state.addComment).toHaveBeenCalledWith({
      target: { type: CommentTargetType.TEXT_SCENARIO },
      text: 'Keep this draft',
    });
  });

  test('retains composer text when a stale or blocked add reports false', async () => {
    const state = createLiveReviewState({ addComment: jest.fn(() => Promise.resolve(false)) });
    const wrapper = shallow(
      <ReviewTarget
        target={{ type: CommentTargetType.PRECONDITION }}
        reviewState={state}
        isInitiallyOpen
      />,
    );
    changeComposer(wrapper, 'Draft stays here');
    await act(async () => {
      submitComposer(wrapper);
      await Promise.resolve();
    });
    expect(wrapper.find('textarea').prop('value')).toBe('Draft stays here');
    expect(wrapper.find('[role="alert"]')).toHaveLength(0);
  });

  test('resets drafts on resource change and does not clear new text after stale mutation completes', async () => {
    let resolve!: (result: boolean) => void;
    const addComment = jest.fn(
      () =>
        new Promise<boolean>((resolvePromise) => {
          resolve = resolvePromise;
        }),
    );
    const state = createLiveReviewState({ addComment });
    let wrapper!: ReturnType<typeof mount> & { update: () => void };
    act(() => {
      wrapper = mount(
        <ReviewTarget
          target={{ type: CommentTargetType.PRECONDITION }}
          reviewState={state}
          isInitiallyOpen
        />,
      ) as typeof wrapper;
    });
    wrapper.update();
    act(() => {
      (
        wrapper.find('textarea').prop('onChange') as (
          event: ChangeEvent<HTMLTextAreaElement>,
        ) => void
      )({ target: { value: 'Old resource draft' } } as ChangeEvent<HTMLTextAreaElement>);
    });
    wrapper.update();
    act(() => {
      (
        wrapper
          .find('button[data-automation-id="add-review-comment"]')
          .prop('onClick') as () => void
      )();
    });
    act(() => {
      wrapper.setProps({ reviewState: createLiveReviewState() });
    });
    wrapper.update();
    expect(wrapper.find('textarea').prop('value')).toBe('');
    act(() => {
      (
        wrapper.find('textarea').prop('onChange') as (
          event: ChangeEvent<HTMLTextAreaElement>,
        ) => void
      )({ target: { value: 'New resource draft' } } as ChangeEvent<HTMLTextAreaElement>);
    });
    await act(async () => {
      resolve(false);
      await Promise.resolve();
    });
    wrapper.update();
    expect(wrapper.find('textarea').prop('value')).toBe('New resource draft');
    act(() => {
      wrapper.unmount();
    });
  });

  test('hides composer and delete controls for a locked native thread while keeping comments readable', () => {
    const wrapper = shallow(
      <ReviewTarget
        target={{ type: CommentTargetType.PRECONDITION }}
        reviewState={createLiveReviewState({
          comments: [{ ...comments[0], target: { type: CommentTargetType.PRECONDITION } }],
        })}
        isInitiallyOpen
        isReadOnly
      />,
    );
    expect(wrapper.text()).toContain('Use the Library label');
    expect(wrapper.find('textarea')).toHaveLength(0);
    expect(wrapper.find('[aria-label="Delete comment"]')).toHaveLength(0);
  });
});
