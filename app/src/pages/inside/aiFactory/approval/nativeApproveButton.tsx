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

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useIntl, type MessageDescriptor } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Tooltip } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { getNativeTestCaseSummary } from 'common/utils/nativeTestCase';
import type { ExtendedTestCase } from 'types/testCase';
import type { LiveReviewCommentsLoadState } from 'pages/inside/aiFactory/review/useLiveReviewComments';
import { NativeApprovalError } from 'pages/inside/aiFactory/approval/nativeApproval';
import { messages } from 'pages/inside/aiFactory/approval/messages';

interface NativeApproveButtonProps {
  testCase: ExtendedTestCase;
  reviewState?: LiveReviewCommentsLoadState;
  onRefresh: () => void;
  className?: string;
}

const getDisabledHint = (state?: LiveReviewCommentsLoadState): MessageDescriptor | undefined => {
  if (!state?.isLoaded || state.isLoading || state.isError || !state.approveReady)
    return messages.reviewUnavailableHint;
  if (state.isApproved) return messages.approvalCompletedHint;
  if (state.isMutating) return messages.reviewMutationHint;
  if (state.fixInProgress) return messages.fixRunningHint;
  if (state.unsentCount !== 0) return messages.unsentCommentsHint;
  return undefined;
};

export const NativeApproveButton = ({
  testCase,
  reviewState,
  onRefresh,
  className,
}: NativeApproveButtonProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const isAiFactoryEnabled = useAiFactoryEnabled();
  const { canReviewAiTestCases } = useUserPermissions();
  const summary = getNativeTestCaseSummary(testCase);
  const isEligible =
    isAiFactoryEnabled && canReviewAiTestCases && summary?.isAi && summary.status === 'DRAFT';
  const resourceKey = reviewState?.resourceKey;
  const scope = useMemo(
    () => ({ projectKey, testCaseId: testCase.id, resourceKey, isEligible }),
    [projectKey, testCase.id, resourceKey, isEligible],
  );
  const currentScope = useRef<typeof scope | null>(scope);
  useLayoutEffect(() => {
    currentScope.current = scope;
    return () => {
      if (currentScope.current === scope) currentScope.current = null;
    };
  }, [scope]);
  const disabledHint = getDisabledHint(reviewState);
  const approve = async () => {
    const isCurrent = () => currentScope.current === scope;
    if (!isEligible || disabledHint || !isCurrent()) return;
    try {
      const isApproved = await reviewState.approveReady();
      if (!isApproved || !isCurrent()) return;
      dispatch(showSuccessNotification({ message: formatMessage(messages.approvedSuccess) }));
      onRefresh();
    } catch (error: unknown) {
      if (!isCurrent()) return;
      const message =
        error instanceof NativeApprovalError && error.reason === 'CONFLICT'
          ? messages.approvalConflict
          : messages.updateFailed;
      dispatch(showErrorNotification({ message: formatMessage(message) }));
      onRefresh();
    }
  };
  if (!isEligible) return null;
  const button = (
    <Button
      variant="primary"
      className={className}
      disabled={Boolean(disabledHint)}
      data-automation-id="native-test-case-approve"
      onClick={() => void approve()}
    >
      {formatMessage(messages.approve)}
    </Button>
  );
  return disabledHint ? (
    <Tooltip placement="top" content={formatMessage(disabledHint)}>
      <span>{button}</span>
    </Tooltip>
  ) : (
    button
  );
};
