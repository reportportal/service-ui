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

import { useIntl } from 'react-intl';
import { Button } from '@reportportal/ui-kit';

import { useUserPermissions } from 'hooks/useUserPermissions';

import { messages } from './messages';
import { useLifecycleActions } from './useLifecycleActions';

interface BulkApproveButtonProps {
  testCaseIds: number[];
  onSuccess?: () => void;
}

export const BulkApproveButton = ({ testCaseIds, onSuccess }: BulkApproveButtonProps) => {
  const { formatMessage } = useIntl();
  const { canReviewAiTestCases } = useUserPermissions();
  const { isLoading, updateLifecycleBatch } = useLifecycleActions({
    onBatchSuccess: onSuccess,
  });

  if (!canReviewAiTestCases) return null;

  return (
    <Button
      variant="ghost"
      disabled={isLoading || testCaseIds.length === 0}
      data-automation-id="bulk-approve-test-cases"
      onClick={() => void updateLifecycleBatch(testCaseIds)}
    >
      {formatMessage(messages.approve)}
    </Button>
  );
};
