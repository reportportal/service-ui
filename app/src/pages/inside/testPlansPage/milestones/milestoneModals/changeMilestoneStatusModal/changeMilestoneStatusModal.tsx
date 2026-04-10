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

import { isBefore } from 'date-fns';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { Button, Toggle } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { MilestoneStatus, type TmsMilestoneType } from 'controllers/milestone';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import {
  dateOnlyStringToUtcIso,
  formatIsoDateShortDashed,
  isoToDateOnlyFormValue,
  parseDateOnly,
} from '../../milestoneDateUtils';
import { messages as milestoneTableMessages } from '../../milestonesTable/messages';
import { todayDateOnly } from '../../datePickerConstants';
import { BackToScheduledAdjustFormConnected } from './backToScheduledAdjustForm';
import {
  ADJUST_FORM_DOM_ID,
  CHANGE_MILESTONE_STATUS_ADJUST_FORM_NAME,
  changeMilestoneStatusFlowType,
} from './constants';
import { changeMilestoneStatusModalMessages } from './messages';
import {
  MilestoneStatusModalFooter,
  MilestoneStatusModalFooterButtonWrap,
  MilestoneStatusModalFrame,
} from './milestoneStatusModalFrame';
import type {
  ChangeMilestoneStatusModalProps,
  MilestoneAdjustFormValues,
  MilestoneStatusPatchBody,
} from './types';
import { useChangeMilestoneStatus } from './useChangeMilestoneStatus';
import { getChangeMilestoneStatusFlow } from '../utils';

import styles from './changeMilestoneStatusModal.scss';

const cx = createClassnames(styles);

const bold = (text: ReactNode[]) => <span className={cx('change-milestone-status-modal__bold')}>{text}</span>;

export const ChangeMilestoneStatusModal = ({ data }: ChangeMilestoneStatusModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const hideModal = () => dispatch(hideModalAction());
  const [adjustMilestone, setAdjustMilestone] = useState(false);
  const flow = useMemo(
    () => (data ? getChangeMilestoneStatusFlow(data.milestone, data.targetStatus) : null),
    [data],
  );
  const milestone = data?.milestone;
  const { isLoading, updateMilestone } = useChangeMilestoneStatus({
    milestoneId: milestone?.id || null,
  });

  useEffect(() => {
    setAdjustMilestone(false);
  }, [milestone?.id, data?.targetStatus]);

  const todayIso = useMemo(() => dateOnlyStringToUtcIso(todayDateOnly()), []);

  const baseBody = useMemo((): Omit<MilestoneStatusPatchBody, 'status'> | null => {
    if (!milestone) {
      return null;
    }

    return {
      name: milestone.name,
      type: milestone.type,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
    };
  }, [milestone]);

  const transitionMilestoneToTesting = (
    overrides: Partial<Pick<MilestoneStatusPatchBody, 'startDate'>>,
  ) => {
    if (!baseBody) {
      return;
    }

    void updateMilestone(
      { ...baseBody, ...overrides, status: MilestoneStatus.TESTING },
      'milestoneTestingStartedSuccess',
    );
  };

  const transitionMilestoneToCompleted = (
    overrides: Partial<Pick<MilestoneStatusPatchBody, 'endDate'>>,
  ) => {
    if (!baseBody) {
      return;
    }

    void updateMilestone(
      { ...baseBody, ...overrides, status: MilestoneStatus.COMPLETED },
      'milestoneCompletedSuccess',
    );
  };

  const onAdjustScheduledSubmit = (values: MilestoneAdjustFormValues) => {
    if (!milestone) {
      return;
    }

    const startParsed = parseDateOnly(values.startDate.trim());
    const endParsed = parseDateOnly(values.endDate.trim());

    if (!startParsed || !endParsed || isBefore(endParsed, startParsed)) {
      return;
    }

    const startIso = dateOnlyStringToUtcIso(values.startDate.trim());
    const endIso = dateOnlyStringToUtcIso(values.endDate.trim());

    if (!startIso || !endIso) {
      return;
    }

    void updateMilestone(
      {
        name: milestone.name,
        type: values.type as TmsMilestoneType,
        status: MilestoneStatus.SCHEDULED,
        startDate: startIso,
        endDate: endIso,
      },
      'milestoneStatusChangedToScheduledSuccess',
    );
  };

  const confirmBackToScheduledKeepingFields = () => {
    if (!baseBody) {
      return;
    }

    void updateMilestone(
      { ...baseBody, status: MilestoneStatus.SCHEDULED },
      'milestoneStatusChangedToScheduledSuccess',
    );
  };

  const confirmBackToTesting = () => {
    if (!baseBody) {
      return;
    }

    void updateMilestone(
      { ...baseBody, status: MilestoneStatus.TESTING },
      'milestoneStatusChangedToTestingSuccess',
    );
  };

  const toggleAdjustMilestone = () =>
    setAdjustMilestone((wasAdjustMilestoneOn) => !wasAdjustMilestoneOn);

  const startTestingKeepStartDate = () => transitionMilestoneToTesting({});

  const startTestingWithTodayStartDate = () => transitionMilestoneToTesting({ startDate: todayIso });

  const startTestingClearStartDate = () => transitionMilestoneToTesting({ startDate: null });

  const completeMilestoneKeepDeadline = () => transitionMilestoneToCompleted({});

  const completeMilestoneWithTodayDeadline = () =>
    transitionMilestoneToCompleted({ endDate: todayIso });

  const completeMilestoneClearDeadline = () => transitionMilestoneToCompleted({ endDate: null });

  const adjustFormValuesSelector = useMemo(
    () => formValueSelector(CHANGE_MILESTONE_STATUS_ADJUST_FORM_NAME),
    [],
  );

  const adjustFormStartDate = useSelector(
    (state) => adjustFormValuesSelector(state, 'startDate') as string | undefined,
  );

  const adjustFormEndDate = useSelector(
    (state) => adjustFormValuesSelector(state, 'endDate') as string | undefined,
  );

  const isAdjustChangeDisabled = useMemo(() => {
    if (!adjustMilestone) {
      return false;
    }

    const start = (adjustFormStartDate ?? '').trim();
    const end = (adjustFormEndDate ?? '').trim();

    if (!start || !end) {
      return true;
    }

    const startParsed = parseDateOnly(start);
    const endParsed = parseDateOnly(end);

    if (!startParsed || !endParsed) {
      return true;
    }

    return isBefore(endParsed, startParsed);
  }, [adjustMilestone, adjustFormStartDate, adjustFormEndDate]);

  if (!milestone || !flow) {
    return null;
  }

  const scheduledStatusLabel = formatMessage(milestoneTableMessages.statusScheduled);
  const testingStatusLabel = formatMessage(milestoneTableMessages.statusTesting);

  const bodyClass = cx('change-milestone-status-modal__body');
  const bodyTextClass = cx('change-milestone-status-modal__body-text');
  const toggleRowClass = cx('change-milestone-status-modal__toggle-row');

  switch (flow.type) {
    case changeMilestoneStatusFlowType.BACK_TO_SCHEDULED: {
      const initialAdjustValues: MilestoneAdjustFormValues = {
        type: milestone.type,
        startDate: isoToDateOnlyFormValue(milestone.startDate),
        endDate: isoToDateOnlyFormValue(milestone.endDate),
      };

      return (
        <MilestoneStatusModalFrame
          title={formatMessage(changeMilestoneStatusModalMessages.backToScheduledTitle)}
          allowCloseOutside={!adjustMilestone}
          onClose={hideModal}
          isLoading={isLoading}
          createFooter={(closeModal) => (
            <MilestoneStatusModalFooter>
              <MilestoneStatusModalFooterButtonWrap>
                <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
                  {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
                </Button>
              </MilestoneStatusModalFooterButtonWrap>
              <MilestoneStatusModalFooterButtonWrap>
                <Button
                  variant="primary"
                  disabled={isLoading || (adjustMilestone && isAdjustChangeDisabled)}
                  {...(adjustMilestone
                    ? { type: 'submit' as const, form: ADJUST_FORM_DOM_ID }
                    : { onClick: confirmBackToScheduledKeepingFields })}
                >
                  <LoadingSubmitButton isLoading={isLoading}>
                    {formatMessage(changeMilestoneStatusModalMessages.changeAction)}
                  </LoadingSubmitButton>
                </Button>
              </MilestoneStatusModalFooterButtonWrap>
            </MilestoneStatusModalFooter>
          )}
        >
          <p className={bodyClass}>
            {formatMessage(changeMilestoneStatusModalMessages.backToScheduledBody, {
              name: milestone.name,
              status: scheduledStatusLabel,
              b: bold,
            })}
          </p>
          <div className={toggleRowClass}>
            <Toggle value={adjustMilestone} onChange={toggleAdjustMilestone} disabled={isLoading}>
              {formatMessage(changeMilestoneStatusModalMessages.adjustMilestoneToggle)}
            </Toggle>
          </div>
          {adjustMilestone && (
            <BackToScheduledAdjustFormConnected
              key={milestone.id}
              initialValues={initialAdjustValues}
              enableReinitialize
              isLoading={isLoading}
              onValidSubmit={onAdjustScheduledSubmit}
            />
          )}
        </MilestoneStatusModalFrame>
      );
    }

    case changeMilestoneStatusFlowType.BACK_TO_TESTING:
      return (
        <MilestoneStatusModalFrame
          title={formatMessage(changeMilestoneStatusModalMessages.backToTestingTitle)}
          onClose={hideModal}
          isLoading={isLoading}
          createFooter={(closeModal) => (
            <MilestoneStatusModalFooter>
              <MilestoneStatusModalFooterButtonWrap>
                <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
                  {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
                </Button>
              </MilestoneStatusModalFooterButtonWrap>
              <MilestoneStatusModalFooterButtonWrap>
                <Button variant="primary" disabled={isLoading} onClick={confirmBackToTesting}>
                  <LoadingSubmitButton isLoading={isLoading}>
                    {formatMessage(changeMilestoneStatusModalMessages.changeAction)}
                  </LoadingSubmitButton>
                </Button>
              </MilestoneStatusModalFooterButtonWrap>
            </MilestoneStatusModalFooter>
          )}
        >
          <p className={bodyClass}>
            {formatMessage(changeMilestoneStatusModalMessages.backToTestingBody, {
              name: milestone.name,
              status: testingStatusLabel,
              b: bold,
            })}
          </p>
        </MilestoneStatusModalFrame>
      );

    case changeMilestoneStatusFlowType.START_TESTING_SIMPLE:
      return (
        <MilestoneStatusModalFrame
          title={formatMessage(changeMilestoneStatusModalMessages.startTestingTitle)}
          onClose={hideModal}
          isLoading={isLoading}
          createFooter={(closeModal) => (
            <MilestoneStatusModalFooter>
              <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
                {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
              </Button>
              <Button variant="primary" disabled={isLoading} onClick={startTestingKeepStartDate}>
                <LoadingSubmitButton isLoading={isLoading}>
                  {formatMessage(changeMilestoneStatusModalMessages.startTestingPrimary)}
                </LoadingSubmitButton>
              </Button>
            </MilestoneStatusModalFooter>
          )}
        >
          <p className={bodyClass}>
            {formatMessage(changeMilestoneStatusModalMessages.startTestingSimpleBody, {
              name: milestone.name,
              b: bold,
            })}
          </p>
        </MilestoneStatusModalFrame>
      );

    case changeMilestoneStatusFlowType.START_TESTING_DATE_CHOICE:
      return (
        <MilestoneStatusModalFrame
          title={formatMessage(changeMilestoneStatusModalMessages.startTestingTitle)}
          onClose={hideModal}
          isLoading={isLoading}
          className={cx('change-milestone-status-modal_wide')}
          createFooter={(closeModal) => (
            <MilestoneStatusModalFooter>
              <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
                {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
              </Button>
              <Button variant="ghost" disabled={isLoading} onClick={startTestingKeepStartDate}>
                {formatMessage(changeMilestoneStatusModalMessages.startWithoutReplacing)}
              </Button>
              <Button variant="primary" disabled={isLoading} onClick={startTestingWithTodayStartDate}>
                <LoadingSubmitButton isLoading={isLoading}>
                  {formatMessage(changeMilestoneStatusModalMessages.startWithToday)}
                </LoadingSubmitButton>
              </Button>
            </MilestoneStatusModalFooter>
          )}
        >
          <div className={bodyTextClass}>
            <p className={bodyClass}>
              {formatMessage(changeMilestoneStatusModalMessages.startTestingReplaceBodyLead, {
                name: milestone.name,
                date: formatIsoDateShortDashed(flow.startDateIso),
                b: bold,
              })}
            </p>
            <p className={bodyClass}>
              {formatMessage(changeMilestoneStatusModalMessages.startTestingReplaceBodyFollowUp)}
            </p>
          </div>
        </MilestoneStatusModalFrame>
      );

    case changeMilestoneStatusFlowType.START_TESTING_NO_START_DATE:
      return (
        <MilestoneStatusModalFrame
          title={formatMessage(changeMilestoneStatusModalMessages.startTestingTitle)}
          onClose={hideModal}
          isLoading={isLoading}
          className={cx('change-milestone-status-modal_wide')}
          createFooter={(closeModal) => (
            <MilestoneStatusModalFooter>
              <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
                {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
              </Button>
              <Button variant="ghost" disabled={isLoading} onClick={startTestingClearStartDate}>
                {formatMessage(changeMilestoneStatusModalMessages.startWithoutDate)}
              </Button>
              <Button variant="primary" disabled={isLoading} onClick={startTestingWithTodayStartDate}>
                <LoadingSubmitButton isLoading={isLoading}>
                  {formatMessage(changeMilestoneStatusModalMessages.startWithToday)}
                </LoadingSubmitButton>
              </Button>
            </MilestoneStatusModalFooter>
          )}
        >
          <div className={bodyTextClass}>
            <p className={bodyClass}>
              {formatMessage(changeMilestoneStatusModalMessages.startTestingNoStartBodyLead, {
                name: milestone.name,
                b: bold,
              })}
            </p>
            <p className={bodyClass}>
              {formatMessage(changeMilestoneStatusModalMessages.startTestingNoStartBodyFollowUp)}
            </p>
          </div>
        </MilestoneStatusModalFrame>
      );

    case changeMilestoneStatusFlowType.COMPLETE_SIMPLE:
      return (
        <MilestoneStatusModalFrame
          title={formatMessage(changeMilestoneStatusModalMessages.completeMilestoneTitle)}
          onClose={hideModal}
          isLoading={isLoading}
          createFooter={(closeModal) => (
            <MilestoneStatusModalFooter>
              <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
                {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
              </Button>
              <Button variant="primary" disabled={isLoading} onClick={completeMilestoneKeepDeadline}>
                <LoadingSubmitButton isLoading={isLoading}>
                  {formatMessage(changeMilestoneStatusModalMessages.completeMilestonePrimary)}
                </LoadingSubmitButton>
              </Button>
            </MilestoneStatusModalFooter>
          )}
        >
          <p className={bodyClass}>
            {formatMessage(changeMilestoneStatusModalMessages.completeSimpleBody, {
              name: milestone.name,
              b: bold,
            })}
          </p>
        </MilestoneStatusModalFrame>
      );

    case changeMilestoneStatusFlowType.COMPLETE_DATE_CHOICE:
      return (
        <MilestoneStatusModalFrame
          title={formatMessage(changeMilestoneStatusModalMessages.completeMilestoneTitle)}
          onClose={hideModal}
          isLoading={isLoading}
          className={cx('change-milestone-status-modal_wide')}
          createFooter={(closeModal) => (
            <MilestoneStatusModalFooter>
              <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
                {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
              </Button>
              <Button variant="ghost" disabled={isLoading} onClick={completeMilestoneKeepDeadline}>
                {formatMessage(changeMilestoneStatusModalMessages.completeWithoutReplacing)}
              </Button>
              <Button variant="primary" disabled={isLoading} onClick={completeMilestoneWithTodayDeadline}>
                <LoadingSubmitButton isLoading={isLoading}>
                  {formatMessage(changeMilestoneStatusModalMessages.completeWithToday)}
                </LoadingSubmitButton>
              </Button>
            </MilestoneStatusModalFooter>
          )}
        >
          <div className={bodyTextClass}>
            <p className={bodyClass}>
              {formatMessage(changeMilestoneStatusModalMessages.completeReplaceBodyLead, {
                name: milestone.name,
                b: bold,
              })}
            </p>
            <p className={bodyClass}>
              {formatMessage(changeMilestoneStatusModalMessages.completeReplaceBodyFollowUp, {
                date: formatIsoDateShortDashed(flow.deadlineIso),
                b: bold,
              })}
            </p>
          </div>
        </MilestoneStatusModalFrame>
      );

    case changeMilestoneStatusFlowType.COMPLETE_NO_DEADLINE:
      return (
        <MilestoneStatusModalFrame
          title={formatMessage(changeMilestoneStatusModalMessages.completeMilestoneTitle)}
          onClose={hideModal}
          isLoading={isLoading}
          className={cx('change-milestone-status-modal_wide')}
          createFooter={(closeModal) => (
            <MilestoneStatusModalFooter>
              <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
                {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
              </Button>
              <Button variant="ghost" disabled={isLoading} onClick={completeMilestoneClearDeadline}>
                {formatMessage(changeMilestoneStatusModalMessages.completeWithoutDeadline)}
              </Button>
              <Button variant="primary" disabled={isLoading} onClick={completeMilestoneWithTodayDeadline}>
                <LoadingSubmitButton isLoading={isLoading}>
                  {formatMessage(changeMilestoneStatusModalMessages.completeWithToday)}
                </LoadingSubmitButton>
              </Button>
            </MilestoneStatusModalFooter>
          )}
        >
          <div className={bodyTextClass}>
            <p className={bodyClass}>
              {formatMessage(changeMilestoneStatusModalMessages.completeNoDeadlineBodyLead, {
                name: milestone.name,
                b: bold,
              })}
            </p>
            <p className={bodyClass}>
              {formatMessage(changeMilestoneStatusModalMessages.completeNoDeadlineBodyFollowUp)}
            </p>
          </div>
        </MilestoneStatusModalFrame>
      );

    default:
      return null;
  }
};
