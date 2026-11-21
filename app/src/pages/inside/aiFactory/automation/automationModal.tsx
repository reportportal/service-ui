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

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, Dropdown, Modal, SystemMessage } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MODAL_Z_INDEX } from 'common/constants/zIndex';
import type { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showWarningNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project/selectors/typed-selectors';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { usePipelineCiConnection } from 'pages/inside/aiFactory/pipelineSettings/usePipelineCiConnection';
import type { AutomateAcceptedRS } from 'types/aiFactory';

import {
  getAutomationCandidateLabel,
  partitionAutomationSelection,
  type AutomationCandidate,
} from './automationUtils';
import { useAutomationRequest, type AutomationRequestError } from './useAutomationRequest';
import { automationSkipReasonMessages, messages } from './messages';
import styles from './automationModal.scss';

const cx = createClassnames(styles);

export const AUTOMATION_MODAL_KEY = 'aiFactoryAutomationModal';

export interface AutomationModalData {
  testCases: AutomationCandidate[];
  isPreview?: boolean;
  isMock?: boolean;
  pipelineId?: number;
  expectedProjectKey?: string;
  onCiUnavailable?: () => void;
  onSuccess?: (response: AutomateAcceptedRS) => void;
}

const ERROR_MESSAGES: Record<AutomationRequestError, typeof messages.startFailed> = {
  ENVIRONMENTS_LOAD_FAILED: messages.loadEnvironmentsFailed,
  ENVIRONMENTS_NOT_CONFIGURED: messages.environmentsNotConfigured,
  INVALID_ENVIRONMENTS_RESPONSE: messages.invalidEnvironmentsResponse,
  REAUTOMATE_CONFIRMATION_REQUIRED: messages.confirmCases,
  CI_NOT_CONNECTED: messages.unavailableCiConnection,
  NO_ELIGIBLE_TEST_CASES: messages.noEligibleCases,
  JOB_START_FAILED: messages.startFailed,
  START_NOT_CONFIRMED: messages.startNotConfirmed,
  INVALID_AUTOMATION_RESPONSE: messages.invalidStartResponse,
};

const BLOCKED_ERRORS = new Set<AutomationRequestError>([
  'CI_NOT_CONNECTED',
  'NO_ELIGIBLE_TEST_CASES',
  'START_NOT_CONFIRMED',
  'INVALID_AUTOMATION_RESPONSE',
]);

export const AutomationModalContent = ({
  data: {
    testCases,
    isMock = false,
    pipelineId,
    isPreview = !isMock && !pipelineId,
    expectedProjectKey,
    onCiUnavailable,
    onSuccess,
  },
}: UseModalData<AutomationModalData>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { canAutomateTestCases } = useUserPermissions();
  const selection = useMemo(() => partitionAutomationSelection(testCases), [testCases]);
  const [environment, setEnvironment] = useState('');
  const isCurrentProject = expectedProjectKey === undefined || expectedProjectKey === projectKey;
  const canRequest = !isPreview && isCurrentProject && Boolean(pipelineId || isMock);
  const { connection, isLoading, failed, refresh } = usePipelineCiConnection(
    canRequest && canAutomateTestCases ? projectKey : '',
    pipelineId,
  );
  const canStart = isMock || connection?.canStartJobs === true;
  const request = useAutomationRequest(projectKey, canRequest, pipelineId);
  useEffect(() => {
    if (request.error === 'CI_NOT_CONNECTED' || request.error === 'JOB_START_FAILED') {
      onCiUnavailable?.();
      refresh();
    }
  }, [onCiUnavailable, refresh, request.error]);
  const environments = request.environments?.environments;
  const selectedEnvironment = environments?.includes(environment)
    ? environment
    : request.environments?.default;
  const confirmationIds = request.reautomationRequiredIds;
  const requiresConfirmation = confirmationIds.length > 0;
  const displayedEligible = request.error === 'NO_ELIGIBLE_TEST_CASES' ? [] : selection.eligible;
  const testCaseById = new Map(testCases.map((testCase) => [testCase.id, testCase]));
  const labelForCase = (id: number, fallback = String(id)) => {
    const testCase = testCaseById.get(id);
    return testCase ? getAutomationCandidateLabel(testCase) : fallback;
  };
  const skipped = [
    ...selection.skipped.map((testCase) => ({
      id: testCase.id,
      label: getAutomationCandidateLabel(testCase),
      reason: testCase.reason,
    })),
    ...request.skipped.map(({ id, displayId, reason }) => ({
      id,
      label: labelForCase(id, displayId),
      reason,
    })),
  ];

  const close = () => {
    if (!request.isStarting) dispatch(hideModalAction());
  };

  const handleSuccess = (response: AutomateAcceptedRS & { unconfirmed?: number[] }) => {
    onSuccess?.(response);
    const values = { number: response.iteration.number, count: response.accepted.length };
    if (response.unconfirmed?.length) {
      dispatch(
        showWarningNotification({
          message: formatMessage(messages.startedWithUnconfirmedCases, {
            ...values,
            cases: response.unconfirmed.map((id) => labelForCase(id)).join(', '),
          }),
        }),
      );
    } else if (response.skipped.length > 0) {
      const skippedCases = response.skipped
        .map(
          ({ id, displayId, reason }) =>
            `${labelForCase(id, displayId)} — ${formatMessage(automationSkipReasonMessages[reason])}`,
        )
        .join(', ');
      dispatch(
        showWarningNotification({
          message: formatMessage(messages.startedWithSkipped, { ...values, cases: skippedCases }),
        }),
      );
    } else {
      dispatch(showSuccessNotification({ message: formatMessage(messages.started, values) }));
    }
    dispatch(hideModalAction());
  };

  const isSubmitDisabled =
    !canAutomateTestCases ||
    !canStart ||
    request.isStarting ||
    request.isLoadingEnvironments ||
    !selectedEnvironment ||
    !selection.eligible.length ||
    (request.error !== null && BLOCKED_ERRORS.has(request.error));

  const start = async () => {
    if (!canRequest || isSubmitDisabled || !selectedEnvironment) return;

    const response = await request.start({
      testCaseIds: selection.eligible.map(({ id }) => id),
      environment: selectedEnvironment,
      ...(requiresConfirmation && {
        confirmReautomate: true,
        confirmedTestCaseIds: confirmationIds,
      }),
    });
    if (response) handleSuccess(response);
  };

  const connectionMessage =
    canRequest && !canStart && request.error !== 'CI_NOT_CONNECTED'
      ? (isLoading && messages.checkingCiConnection) ||
        (failed && messages.loadCiConnectionFailed) ||
        messages.unavailableCiConnection
      : null;

  return (
    <Modal
      title={formatMessage(requiresConfirmation ? messages.confirmTitle : messages.title)}
      okButton={
        canRequest
          ? {
              children: formatMessage(
                requiresConfirmation ? messages.confirmAction : messages.send,
              ),
              disabled: isSubmitDisabled,
              onClick: () => void start(),
            }
          : undefined
      }
      cancelButton={{
        children: formatMessage(canRequest ? COMMON_LOCALE_KEYS.CANCEL : COMMON_LOCALE_KEYS.CLOSE),
        disabled: request.isStarting,
      }}
      allowCloseOutside={!request.isStarting}
      onClose={close}
      zIndex={MODAL_Z_INDEX}
    >
      <div className={cx('automation-modal')}>
        {requiresConfirmation ? (
          <div className={cx('automation-modal__confirmation')}>
            <p className={cx('automation-modal__summary')}>
              {formatMessage(messages.confirmCases)}
            </p>
            <ul className={cx('automation-modal__case-list')}>
              {confirmationIds.map((id) => (
                <li key={id}>{labelForCase(id)}</li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <p className={cx('automation-modal__summary')}>
              {formatMessage(messages.selectedSummary, {
                selected: testCases.length,
                eligible: displayedEligible.length,
              })}
            </p>
            {displayedEligible.length > 0 && (
              <div>
                <h3 className={cx('automation-modal__list-title')}>
                  {formatMessage(messages.testCasesTitle)}
                </h3>
                <ul className={cx('automation-modal__case-list')}>
                  {displayedEligible.map((testCase) => (
                    <li key={testCase.id}>{getAutomationCandidateLabel(testCase)}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        {isPreview && (
          <SystemMessage mode="info">{formatMessage(messages.previewNotice)}</SystemMessage>
        )}
        {!isCurrentProject && (
          <SystemMessage mode="info">{formatMessage(messages.projectChanged)}</SystemMessage>
        )}
        {connectionMessage && (
          <SystemMessage mode={isLoading ? 'info' : 'error'}>
            {formatMessage(connectionMessage)}
            {failed && (
              <Button variant="text" onClick={refresh}>
                {formatMessage(messages.retry)}
              </Button>
            )}
          </SystemMessage>
        )}
        {canRequest && request.isLoadingEnvironments && (
          <output>{formatMessage(messages.loadingEnvironments)}</output>
        )}
        {canRequest && request.environments && !requiresConfirmation && (
          <div>
            <Dropdown
              className={cx('automation-modal__environment')}
              data-automation-id="automationEnvironment"
              label={formatMessage(messages.environment)}
              options={request.environments.environments.map((item) => ({
                label: item,
                value: item,
              }))}
              value={selectedEnvironment}
              disabled={request.isStarting}
              onChange={(value) => {
                if (!Array.isArray(value) && typeof value === 'string') setEnvironment(value);
              }}
            />
            <p className={cx('automation-modal__hint')}>
              {formatMessage(messages.environmentSource)}
            </p>
          </div>
        )}
        {skipped.length > 0 && (
          <div>
            <h3 className={cx('automation-modal__skipped-title')}>
              {formatMessage(messages.skippedTitle)}
            </h3>
            <ul className={cx('automation-modal__skipped-list')}>
              {skipped.map(({ id, label, reason }) => (
                <li key={id}>
                  {label}{' '}
                  <span className={cx('automation-modal__skipped-reason')}>
                    · {formatMessage(automationSkipReasonMessages[reason])}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {canRequest && request.error && request.error !== 'REAUTOMATE_CONFIRMATION_REQUIRED' && (
          <SystemMessage mode="error">
            {formatMessage(ERROR_MESSAGES[request.error])}
            {(request.error === 'ENVIRONMENTS_LOAD_FAILED' ||
              request.error === 'INVALID_ENVIRONMENTS_RESPONSE' ||
              request.error === 'ENVIRONMENTS_NOT_CONFIGURED') && (
              <Button
                variant="text"
                onClick={request.reloadEnvironments}
                data-automation-id="retryAutomationEnvironments"
              >
                {formatMessage(messages.retry)}
              </Button>
            )}
          </SystemMessage>
        )}
      </div>
    </Modal>
  );
};

export const AutomationModal = AutomationModalContent;
