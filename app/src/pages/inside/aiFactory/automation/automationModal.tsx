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

import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, Checkbox, Dropdown, Modal, SystemMessage } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MODAL_Z_INDEX } from 'common/constants/zIndex';
import type { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showWarningNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project/selectors/typed-selectors';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { AutomationStatus, type AutomateAcceptedRS } from 'types/aiFactory';

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
  onSuccess?: (response: AutomateAcceptedRS) => void;
}

const ERROR_MESSAGES: Record<AutomationRequestError, typeof messages.startFailed> = {
  ENVIRONMENTS_LOAD_FAILED: messages.loadEnvironmentsFailed,
  INVALID_ENVIRONMENTS_RESPONSE: messages.invalidEnvironmentsResponse,
  REAUTOMATE_CONFIRMATION_REQUIRED: messages.reautomationConfirmationRequired,
  JOB_START_FAILED: messages.startFailed,
  INVALID_AUTOMATION_RESPONSE: messages.invalidStartResponse,
};

export const AutomationModalContent = ({
  data: { testCases, onSuccess },
}: UseModalData<AutomationModalData>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { canAutomateTestCases } = useUserPermissions();
  const selection = useMemo(() => partitionAutomationSelection(testCases), [testCases]);
  const [environment, setEnvironment] = useState('');
  const [isReautomationConfirmed, setIsReautomationConfirmed] = useState(false);
  const request = useAutomationRequest(projectKey, true);
  const selectedEnvironment = environment || request.environments?.default || '';
  const knownReautomationIds = selection.eligible
    .filter(({ automation }) => automation?.status === AutomationStatus.AUTOMATED)
    .map(({ id }) => id);
  const reautomationRequiredIds = [
    ...new Set([...knownReautomationIds, ...(request.reautomationRequiredIds ?? [])]),
  ];
  const requiresConfirmation = reautomationRequiredIds.length > 0;
  const testCaseById = new Map(testCases.map((testCase) => [testCase.id, testCase]));

  const close = () => {
    if (!request.isStarting) {
      dispatch(hideModalAction());
    }
  };

  const start = async () => {
    if (!canAutomateTestCases || !selectedEnvironment || !selection.eligible.length) {
      return;
    }

    const response = await request.start({
      testCaseIds: selection.eligible.map(({ id }) => id),
      environment: selectedEnvironment,
      confirmReautomate: isReautomationConfirmed,
    });
    if (!response) {
      return;
    }

    onSuccess?.(response);
    if (response.skipped.length > 0) {
      const skippedCases = response.skipped
        .map(({ id, displayId, reason }) => {
          const testCase = testCaseById.get(id);
          const label = testCase ? getAutomationCandidateLabel(testCase) : displayId;
          return `${label} — ${formatMessage(automationSkipReasonMessages[reason])}`;
        })
        .join('; ');
      dispatch(
        showWarningNotification({
          message: formatMessage(messages.startedWithSkipped, {
            number: response.iteration.number,
            count: response.accepted.length,
            cases: skippedCases,
          }),
        }),
      );
    } else {
      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.started, {
            number: response.iteration.number,
            count: response.accepted.length,
          }),
        }),
      );
    }
    dispatch(hideModalAction());
  };

  const isSubmitDisabled =
    !canAutomateTestCases ||
    request.isStarting ||
    request.isLoadingEnvironments ||
    !selectedEnvironment ||
    !selection.eligible.length ||
    (requiresConfirmation && !isReautomationConfirmed);

  return (
    <Modal
      title={formatMessage(messages.title)}
      okButton={{
        children: formatMessage(messages.automate),
        disabled: isSubmitDisabled,
        onClick: () => void start(),
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        disabled: request.isStarting,
      }}
      allowCloseOutside={!request.isStarting}
      onClose={close}
      zIndex={MODAL_Z_INDEX}
    >
      <div className={cx('automation-modal')}>
        <p className={cx('automation-modal__summary')}>
          {formatMessage(messages.selectedSummary, {
            selected: testCases.length,
            eligible: selection.eligible.length,
          })}
        </p>
        {selection.eligible.length > 0 && (
          <div>
            <h3 className={cx('automation-modal__list-title')}>
              {formatMessage(messages.testCasesTitle)}
            </h3>
            <ul className={cx('automation-modal__case-list')}>
              {selection.eligible.map((testCase) => (
                <li key={testCase.id}>{getAutomationCandidateLabel(testCase)}</li>
              ))}
            </ul>
          </div>
        )}
        {request.environments && (
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
              if (!Array.isArray(value) && typeof value === 'string') {
                request.clearError();
                setEnvironment(value);
              }
            }}
          />
        )}
        {selection.skipped.length > 0 && (
          <div>
            <h3 className={cx('automation-modal__skipped-title')}>
              {formatMessage(messages.skippedTitle)}
            </h3>
            <ul className={cx('automation-modal__skipped-list')}>
              {selection.skipped.map((testCase) => (
                <li key={testCase.id}>
                  {getAutomationCandidateLabel(testCase)}{' '}
                  <span className={cx('automation-modal__skipped-reason')}>
                    · {formatMessage(automationSkipReasonMessages[testCase.reason])}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {requiresConfirmation && (
          <div className={cx('automation-modal__confirmation')}>
            <Checkbox
              data-automation-id="confirmReautomation"
              value={isReautomationConfirmed}
              disabled={request.isStarting}
              onChange={(event) => {
                request.clearError();
                setIsReautomationConfirmed(event.target.checked);
              }}
            >
              {formatMessage(messages.confirmReautomate, {
                cases: reautomationRequiredIds
                  .map((id) => {
                    const testCase = testCaseById.get(id);
                    return testCase ? getAutomationCandidateLabel(testCase) : String(id);
                  })
                  .join(', '),
              })}
            </Checkbox>
          </div>
        )}
        {request.error && (
          <SystemMessage mode="error">
            {formatMessage(ERROR_MESSAGES[request.error])}
            {(request.error === 'ENVIRONMENTS_LOAD_FAILED' ||
              request.error === 'INVALID_ENVIRONMENTS_RESPONSE') && (
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
