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

import { Fragment, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';
import { FieldText } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FieldErrorHint, FieldProvider } from 'components/fields';

import { createMilestoneModalMessages } from '../createMilestoneModal/messages';
import { NAME_FIELD } from '../createMilestoneModal/constants';
import {
  endDateDaysAfterStart,
  endDateMonthsAfterStart,
  nextMondayDateOnly,
  tomorrowDateOnly,
} from '../../datePickerConstants';
import { MilestoneDateShortcutRow } from '../../milestoneDateShortcutRow/milestoneDateShortcutRow';
import { MilestoneDateField } from '../../milestoneDateField/milestoneDateField';
import { MilestoneTypeDropdown } from '../../milestoneTypeDropdown/milestoneTypeDropdown';
import { parseDateOnly } from '../../milestoneDateUtils';

import type { MilestoneFormModalContentProps } from './types';

import styles from '../createMilestoneModal/createMilestoneModal.scss';

const cx = createClassnames(styles);

export const MilestoneFormModalContent = ({
  formName,
  isLoading,
  onChange,
}: MilestoneFormModalContentProps) => {
  const { formatMessage } = useIntl();
  const milestoneFormValues = useMemo(() => formValueSelector(formName), [formName]);
  const startDate = useSelector(
    (state) => milestoneFormValues(state, 'startDate') as string | undefined,
  );
  const endDate = useSelector(
    (state) => milestoneFormValues(state, 'endDate') as string | undefined,
  );

  const startDateAsDate = useMemo((): Date | undefined => {
    if (!startDate?.trim()) return undefined;
    return parseDateOnly(startDate) ?? undefined;
  }, [startDate]);

  const endDateAsDate = useMemo((): Date | undefined => {
    if (!endDate?.trim()) return undefined;
    return parseDateOnly(endDate) ?? undefined;
  }, [endDate]);

  const startDateShortcuts = useMemo(
    () => [
      {
        id: 'tomorrow',
        label: formatMessage(createMilestoneModalMessages.dateShortcutTomorrow),
        onClick: () => onChange('startDate', tomorrowDateOnly()),
      },
      {
        id: 'nextMonday',
        label: formatMessage(createMilestoneModalMessages.dateShortcutNextMonday),
        onClick: () => onChange('startDate', nextMondayDateOnly()),
      },
    ],
    [onChange, formatMessage],
  );

  const endDateShortcuts = useMemo(
    () => [
      {
        id: 'week',
        label: formatMessage(createMilestoneModalMessages.dateShortcutWeek),
        onClick: () => onChange('endDate', endDateDaysAfterStart(startDate, 7)),
      },
      {
        id: 'twoWeeks',
        label: formatMessage(createMilestoneModalMessages.dateShortcutTwoWeeks),
        onClick: () => onChange('endDate', endDateDaysAfterStart(startDate, 14)),
      },
      {
        id: 'oneMonth',
        label: formatMessage(createMilestoneModalMessages.dateShortcutOneMonth),
        onClick: () => onChange('endDate', endDateMonthsAfterStart(startDate, 1)),
      },
    ],
    [onChange, formatMessage, startDate],
  );

  return (
    <Fragment>
      <div className={cx('create-milestone-modal__field')}>
        <FieldProvider
          name={NAME_FIELD}
          placeholder={formatMessage(createMilestoneModalMessages.milestoneNamePlaceholder)}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(COMMON_LOCALE_KEYS.NAME)}
              defaultWidth={false}
              isRequired
            />
          </FieldErrorHint>
        </FieldProvider>
      </div>
      <div className={cx('create-milestone-modal__field')}>
        <Field
          name="type"
          component={MilestoneTypeDropdown}
          props={{ label: formatMessage(createMilestoneModalMessages.typeLabel) }}
        />
      </div>
      <div className={cx('create-milestone-modal__dates')}>
        <div className={cx('create-milestone-modal__field')}>
          <Field
            name="startDate"
            component={MilestoneDateField}
            props={{
              label: formatMessage(createMilestoneModalMessages.startDateLabel),
              placeholder: formatMessage(createMilestoneModalMessages.dateFieldPlaceholder),
              disabled: isLoading,
              maxDate: endDateAsDate,
              shortcutSlot: (
                <MilestoneDateShortcutRow items={startDateShortcuts} disabled={isLoading} />
              ),
            }}
          />
        </div>
        <div className={cx('create-milestone-modal__field')}>
          <Field
            name="endDate"
            component={MilestoneDateField}
            props={{
              label: formatMessage(createMilestoneModalMessages.endDateLabel),
              placeholder: formatMessage(createMilestoneModalMessages.dateFieldPlaceholder),
              disabled: isLoading,
              minDate: startDateAsDate,
              shortcutSlot: (
                <MilestoneDateShortcutRow items={endDateShortcuts} disabled={isLoading} />
              ),
            }}
          />
        </div>
      </div>
    </Fragment>
  );
};
