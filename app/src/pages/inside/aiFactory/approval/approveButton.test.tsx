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
import { shallow } from 'enzyme';
import { Button, Modal, Tooltip } from '@reportportal/ui-kit';

import { useUserPermissions } from 'hooks/useUserPermissions';
import { Lifecycle } from 'types/aiFactory';
import type { ExtendedTestCase } from 'types/testCase';

import { ApproveButton } from './approveButton';
import { BulkApproveButton } from './bulkApproveButton';
import { useLifecycleActions } from './useLifecycleActions';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  Modal: 'Modal',
  Tooltip: 'Tooltip',
}));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage: string },
      values?: Record<string, string | number>,
    ) =>
      Object.entries(values ?? {}).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, `${value}`),
        message.defaultMessage,
      ),
  }),
}));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('./useLifecycleActions', () => ({ useLifecycleActions: jest.fn() }));

const updateLifecycle = jest.fn();
const updateLifecycleBatch = jest.fn();

const testCase = {
  id: 42,
  displayId: 'TC42',
  lifecycle: Lifecycle.DRAFT,
  ai: { factoryKey: 'case' },
  review: { unsentCommentsCount: 0 },
} as unknown as ExtendedTestCase;

describe('ApproveButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: true,
    } as ReturnType<typeof useUserPermissions>);
    jest.mocked(useLifecycleActions).mockReturnValue({
      isLoading: false,
      updateLifecycle,
      updateLifecycleBatch,
    });
  });

  test('disables approval and explains unsent comments', () => {
    const wrapper = shallow(
      <ApproveButton
        testCase={{
          ...testCase,
          review: { unsentCommentsCount: 2 },
        }}
      />,
    );

    expect(wrapper.find(Button).prop('disabled')).toBe(true);
    expect(wrapper.find(Tooltip).prop('content')).toContain('unsent comments');
  });

  test('confirms an obsolete evaluation and retries with confirmation', async () => {
    updateLifecycle.mockResolvedValueOnce('CONFIRM_OBSOLETE').mockResolvedValueOnce('UPDATED');
    const wrapper = shallow(<ApproveButton testCase={testCase} />);

    await act(async () => {
      const onClick = wrapper
        .find('[data-automation-id="test-case-approve"]')
        .prop('onClick') as () => void;
      onClick();
      await Promise.resolve();
    });
    const modal = wrapper.find(Modal);
    expect(modal).toHaveLength(1);
    await act(async () => {
      const okButton = modal.prop('okButton') as { onClick: () => void };
      okButton.onClick();
      await Promise.resolve();
    });

    expect(updateLifecycle).toHaveBeenNthCalledWith(1, testCase, false);
    expect(updateLifecycle).toHaveBeenNthCalledWith(2, testCase, true);
  });

  test('uses Mark as ready for a manual case', () => {
    const wrapper = shallow(
      <ApproveButton
        testCase={{
          ...testCase,
          ai: undefined,
          review: { unsentCommentsCount: 2, fixRound: { number: 1, status: 'RUNNING' } },
        }}
      />,
    );

    expect(wrapper.find('[data-automation-id="test-case-approve"]').prop('children')).toBe(
      'Mark as ready',
    );
    expect(wrapper.find(Button).prop('disabled')).toBe(false);
  });

  test('does not render when review permission is denied', () => {
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: false,
    } as ReturnType<typeof useUserPermissions>);

    const wrapper = shallow(<ApproveButton testCase={testCase} />);

    expect(wrapper.find(Button)).toHaveLength(0);
  });
});

describe('BulkApproveButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: true,
    } as ReturnType<typeof useUserPermissions>);
  });

  test('submits all selected Test Case ids', () => {
    jest.mocked(useLifecycleActions).mockReturnValue({
      isLoading: false,
      updateLifecycle,
      updateLifecycleBatch,
    });
    const wrapper = shallow(<BulkApproveButton testCaseIds={[41, 42]} />);

    const onClick = wrapper.find(Button).prop('onClick') as () => void;
    onClick();

    expect(updateLifecycleBatch).toHaveBeenCalledWith([41, 42]);
  });

  test('does not render for a viewer even with selected Test Case ids', () => {
    jest.mocked(useUserPermissions).mockReturnValue({
      canReviewAiTestCases: false,
    } as ReturnType<typeof useUserPermissions>);

    const wrapper = shallow(<BulkApproveButton testCaseIds={[41, 42]} />);

    expect(wrapper.find(Button)).toHaveLength(0);
    expect(updateLifecycleBatch).not.toHaveBeenCalled();
  });
});
