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

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Modal, Tooltip } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useUserPermissions } from 'hooks/useUserPermissions';
import type { ExtendedTestCase } from 'types/testCase';

import { messages } from './messages';
import { useLifecycleActions } from './useLifecycleActions';

interface ApproveButtonProps {
  testCase: ExtendedTestCase;
  onSuccess?: () => void;
  className?: string;
}

export const ApproveButton = ({ testCase, onSuccess, className }: ApproveButtonProps) => {
  const { formatMessage } = useIntl();
  const { canReviewAiTestCases } = useUserPermissions();
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const { isLoading, updateLifecycle } = useLifecycleActions({ onSingleSuccess: onSuccess });
  const isAiCase = Boolean(testCase.ai);
  const label = formatMessage(isAiCase ? messages.approve : messages.markAsReady);
  let disabledHint: string | null = null;
  if (isAiCase && testCase.review?.fixRound) {
    disabledHint = formatMessage(messages.fixRunningHint);
  } else if (isAiCase && testCase.review?.unsentCommentsCount) {
    disabledHint = formatMessage(messages.unsentCommentsHint);
  }

  const update = async (confirmObsolete = false) => {
    const result = await updateLifecycle(testCase, confirmObsolete);
    if (result === 'CONFIRM_OBSOLETE') {
      setIsConfirmationVisible(true);
    } else if (result === 'UPDATED') {
      setIsConfirmationVisible(false);
    }
  };

  if (!canReviewAiTestCases) return null;

  const button = (
    <Button
      variant="primary"
      className={className}
      disabled={Boolean(disabledHint) || isLoading}
      data-automation-id="test-case-approve"
      onClick={() => void update()}
    >
      {label}
    </Button>
  );

  return (
    <>
      {disabledHint ? (
        <Tooltip placement="top" content={disabledHint}>
          <span>{button}</span>
        </Tooltip>
      ) : (
        button
      )}
      {isConfirmationVisible && (
        <Modal
          title={formatMessage(messages.obsoleteTitle)}
          okButton={{
            children: formatMessage(messages.approveAnyway),
            disabled: isLoading,
            onClick: () => void update(true),
          }}
          cancelButton={{
            children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
            disabled: isLoading,
          }}
          onClose={() => setIsConfirmationVisible(false)}
        >
          {formatMessage(messages.obsoleteDescription)}
        </Modal>
      )}
    </>
  );
};
