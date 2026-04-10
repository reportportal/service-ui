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

import { FormEvent, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Field, formValueSelector, InjectedFormProps, reduxForm } from 'redux-form';

import { createClassnames } from 'common/utils';

import {
  endDateDaysAfterStart,
  endDateMonthsAfterStart,
  todayDateOnly,
  tomorrowDateOnly,
} from '../../datePickerConstants';
import { MilestoneDateShortcutRow } from '../../milestoneDateShortcutRow/milestoneDateShortcutRow';
import { MilestoneDateField } from '../../milestoneDateField/milestoneDateField';
import { MilestoneTypeDropdown } from '../../milestoneTypeDropdown/milestoneTypeDropdown';
import { createMilestoneModalMessages } from '../createMilestoneModal/messages';

import { ADJUST_FORM_DOM_ID, CHANGE_MILESTONE_STATUS_ADJUST_FORM_NAME } from './constants';
import { changeMilestoneStatusModalMessages } from './messages';
import type { MilestoneAdjustFormValues } from './types';

import styles from './changeMilestoneStatusModal.scss';

const cx = createClassnames(styles);

type AdjustFormOwnProps = {
  isLoading: boolean;
  onValidSubmit: (values: MilestoneAdjustFormValues) => void;
};

const BackToScheduledAdjustFormFields = ({
  handleSubmit,
  change,
  isLoading,
  onValidSubmit,
}: InjectedFormProps<MilestoneAdjustFormValues> & AdjustFormOwnProps) => {
  const { formatMessage } = useIntl();
  const milestoneFormValues = useMemo(
    () => formValueSelector(CHANGE_MILESTONE_STATUS_ADJUST_FORM_NAME),
    [],
  );
  const startDate = useSelector(
    (state) => milestoneFormValues(state, 'startDate') as string | undefined,
  );
  const startDateShortcuts = useMemo(
    () => [
      {
        id: 'today',
        label: formatMessage(changeMilestoneStatusModalMessages.dateShortcutToday),
        onClick: () => change('startDate', todayDateOnly()),
      },
      {
        id: 'tomorrow',
        label: formatMessage(createMilestoneModalMessages.dateShortcutTomorrow),
        onClick: () => change('startDate', tomorrowDateOnly()),
      },
    ],
    [change, formatMessage],
  );
  const endDateShortcuts = useMemo(
    () => [
      {
        id: 'week',
        label: formatMessage(createMilestoneModalMessages.dateShortcutWeek),
        onClick: () => change('endDate', endDateDaysAfterStart(startDate, 7)),
      },
      {
        id: 'twoWeeks',
        label: formatMessage(createMilestoneModalMessages.dateShortcutTwoWeeks),
        onClick: () => change('endDate', endDateDaysAfterStart(startDate, 14)),
      },
      {
        id: 'oneMonth',
        label: formatMessage(createMilestoneModalMessages.dateShortcutOneMonth),
        onClick: () => change('endDate', endDateMonthsAfterStart(startDate, 1)),
      },
    ],
    [change, formatMessage, startDate],
  );

  return (
    <form
      id={ADJUST_FORM_DOM_ID}
      onSubmit={handleSubmit(onValidSubmit) as (event: FormEvent) => void}
      className={cx('change-milestone-status-modal__adjust-fields')}
    >
      <div className={cx('change-milestone-status-modal__field')}>
        <Field
          name="type"
          component={MilestoneTypeDropdown}
          props={{ label: formatMessage(createMilestoneModalMessages.typeLabel) }}
        />
      </div>
      <div className={cx('change-milestone-status-modal__dates')}>
        <Field
          name="startDate"
          component={MilestoneDateField}
          props={{
            label: formatMessage(createMilestoneModalMessages.startDateLabel),
            placeholder: formatMessage(createMilestoneModalMessages.dateFieldPlaceholder),
            disabled: isLoading,
            shortcutSlot: (
              <MilestoneDateShortcutRow items={startDateShortcuts} disabled={isLoading} />
            ),
          }}
        />
        <Field
          name="endDate"
          component={MilestoneDateField}
          props={{
            label: formatMessage(createMilestoneModalMessages.endDateLabel),
            placeholder: formatMessage(createMilestoneModalMessages.dateFieldPlaceholder),
            disabled: isLoading,
            shortcutSlot: (
              <MilestoneDateShortcutRow items={endDateShortcuts} disabled={isLoading} />
            ),
          }}
        />
      </div>
    </form>
  );
};

export const BackToScheduledAdjustFormConnected = reduxForm<MilestoneAdjustFormValues, AdjustFormOwnProps>(
  {
    form: CHANGE_MILESTONE_STATUS_ADJUST_FORM_NAME,
    destroyOnUnmount: true,
  },
)(BackToScheduledAdjustFormFields);
