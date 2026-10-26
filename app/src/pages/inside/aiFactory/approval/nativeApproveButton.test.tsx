/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { act } from 'react';
import { mount, shallow } from 'enzyme';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { useUserPermissions } from 'hooks/useUserPermissions';
import type { ExtendedTestCase } from 'types/testCase';
import type { LiveReviewCommentsLoadState } from 'pages/inside/aiFactory/review/useLiveReviewComments';

import { NativeApproveButton } from './nativeApproveButton';
import { NativeApprovalError } from './nativeApproval';

jest.mock('@reportportal/ui-kit', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Tooltip: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({ useSelector: jest.fn(), useDispatch: () => mockDispatch }));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/notification', () => ({
  showErrorNotification: jest.fn((payload) => ({ type: 'ERROR', payload })),
  showSuccessNotification: jest.fn((payload) => ({ type: 'SUCCESS', payload })),
}));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));

const nativeCase = {
  id: 42,
  origin: 'AI',
  status: 'DRAFT',
  metrics: { obsolete: true },
} as unknown as ExtendedTestCase;
const approveReady = jest.fn();
const onRefresh = jest.fn();
const createReview = (
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
  isApproved: false,
  reload: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  discardPending: jest.fn(),
  approveReady,
  ...overrides,
});
const deferred = () => {
  let resolve!: (value: boolean) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<boolean>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const click = async (wrapper: ReturnType<typeof shallow>) => {
  await act(async () => {
    (wrapper.find(Button).prop('onClick') as () => void)();
    await Promise.resolve();
  });
};

describe('NativeApproveButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    approveReady.mockReset();
    jest.mocked(useSelector).mockReturnValue('demo');
    jest.mocked(useAiFactoryEnabled).mockReturnValue(true);
    jest
      .mocked(useUserPermissions)
      .mockReturnValue({ canReviewAiTestCases: true } as ReturnType<typeof useUserPermissions>);
  });

  test('approves obsolete native Draft without a confirmation dialog and refreshes only after success', async () => {
    approveReady.mockResolvedValue(true);
    const wrapper = shallow(
      <NativeApproveButton
        testCase={nativeCase}
        reviewState={createReview()}
        onRefresh={onRefresh}
      />,
    );
    expect(wrapper.find(Button).prop('disabled')).toBe(false);
    await click(wrapper);
    expect(approveReady).toHaveBeenCalledTimes(1);
    expect(showSuccessNotification).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/approved/i) }),
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(wrapper.find('Modal')).toHaveLength(0);
    expect(showErrorNotification).not.toHaveBeenCalled();
  });

  test.each<[string, Partial<LiveReviewCommentsLoadState> | undefined, RegExp]>([
    ['missing Review', undefined, /review/i],
    ['loading', { isLoading: true }, /review/i],
    ['failed Review', { isError: true }, /review/i],
    ['unloaded Review', { isLoaded: false }, /review/i],
    ['unsent comments', { unsentCount: 2 }, /unsent comments/i],
    ['fixing', { fixInProgress: true }, /fix/i],
    ['another mutation', { isMutating: true }, /review/i],
    ['completed approval', { isApproved: true }, /refresh|approved/i],
  ])('disables approval with a localized hint for %s', async (_label, overrides, hint) => {
    const reviewState = overrides ? createReview(overrides) : undefined;
    const wrapper = shallow(
      <NativeApproveButton testCase={nativeCase} reviewState={reviewState} onRefresh={onRefresh} />,
    );
    expect(wrapper.find(Button).prop('disabled')).toBe(true);
    expect(wrapper.find(Tooltip).prop('content')).toMatch(hint);
    await click(wrapper);
    expect(approveReady).not.toHaveBeenCalled();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test.each(['manual', 'ready', 'unknown', 'flag-off', 'viewer'] as const)(
    'hides approval for %s',
    (variant) => {
      if (variant === 'flag-off') jest.mocked(useAiFactoryEnabled).mockReturnValue(false);
      if (variant === 'viewer')
        jest
          .mocked(useUserPermissions)
          .mockReturnValue({ canReviewAiTestCases: false } as ReturnType<
            typeof useUserPermissions
          >);
      const testCase = {
        ...nativeCase,
        ...(variant === 'manual' ? { origin: 'MANUAL' as const } : {}),
        ...(variant === 'ready' ? { status: 'READY' as const } : {}),
        ...(variant === 'unknown' ? { status: undefined } : {}),
      };
      const wrapper = shallow(
        <NativeApproveButton
          testCase={testCase}
          reviewState={createReview()}
          onRefresh={onRefresh}
        />,
      );
      expect(wrapper.find(Button)).toHaveLength(0);
    },
  );

  test.each([
    ['conflict', new NativeApprovalError('CONFLICT'), /review|fix|changed/i],
    ['ordinary failure', new NativeApprovalError('FAILED'), /failed|unable|could not/i],
  ])('shows %s feedback and refreshes authoritative details', async (_label, error, message) => {
    approveReady.mockRejectedValue(error);
    const wrapper = shallow(
      <NativeApproveButton
        testCase={nativeCase}
        reviewState={createReview()}
        onRefresh={onRefresh}
      />,
    );
    await click(wrapper);
    expect(showErrorNotification).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(message) }),
    );
    expect(showSuccessNotification).not.toHaveBeenCalled();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  test('does not notify or refresh when the guarded command returns false', async () => {
    approveReady.mockResolvedValue(false);
    const wrapper = shallow(
      <NativeApproveButton
        testCase={nativeCase}
        reviewState={createReview()}
        onRefresh={onRefresh}
      />,
    );
    await click(wrapper);
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  test('rejects a retained click handler before it can approve or refresh a different case', async () => {
    const wrapper = mount(
      <NativeApproveButton
        testCase={nativeCase}
        reviewState={createReview()}
        onRefresh={onRefresh}
      />,
    );
    const retained = wrapper.find(Button).prop('onClick') as () => void;
    act(() => {
      wrapper.setProps({ testCase: { ...nativeCase, id: 43 }, reviewState: createReview() });
    });
    await act(async () => {
      retained();
      await Promise.resolve();
    });
    expect(approveReady).not.toHaveBeenCalled();
    expect(onRefresh).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    act(() => {
      wrapper.unmount();
    });
  });

  test.each(
    (['case', 'project', 'resource', 'disable', 'unmount', 'return-to-A'] as const).flatMap(
      (navigation) => [false, true].map((fails) => [navigation, fails] as const),
    ),
  )('ignores pending callbacks after %s navigation (failure=%s)', async (navigation, fails) => {
    const pending = deferred();
    approveReady.mockReturnValueOnce(pending.promise);
    const reviewState = createReview();
    const wrapper = mount(
      <NativeApproveButton testCase={nativeCase} reviewState={reviewState} onRefresh={onRefresh} />,
    );
    act(() => {
      (wrapper.find(Button).prop('onClick') as () => void)();
    });
    if (navigation === 'unmount')
      act(() => {
        wrapper.unmount();
      });
    else if (navigation === 'case' || navigation === 'return-to-A') {
      act(() => {
        wrapper.setProps({ testCase: { ...nativeCase, id: 43 } });
      });
      if (navigation === 'return-to-A')
        act(() => {
          wrapper.setProps({ testCase: nativeCase });
        });
    } else if (navigation === 'resource')
      act(() => {
        wrapper.setProps({ reviewState: createReview() });
      });
    else if (navigation === 'disable') {
      jest.mocked(useAiFactoryEnabled).mockReturnValue(false);
      act(() => {
        wrapper.setProps({});
      });
    } else {
      jest.mocked(useSelector).mockReturnValue('other');
      act(() => {
        wrapper.setProps({});
      });
    }
    await act(async () => {
      if (fails) pending.reject(new NativeApprovalError('CONFLICT'));
      else pending.resolve(true);
      await Promise.resolve();
    });
    expect(onRefresh).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    if (navigation !== 'unmount')
      act(() => {
        wrapper.unmount();
      });
    jest.mocked(useAiFactoryEnabled).mockReturnValue(true);
    jest.mocked(useSelector).mockReturnValue('demo');
  });
});
