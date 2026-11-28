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

import { ChangeEvent } from 'react';
import { useIntl } from 'react-intl';
import { Field, WrappedFieldProps } from 'redux-form';
import { Checkbox } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import {
  AUTO_COMPLETE_AFTER_DEADLINE_FIELD,
  AUTO_START_ON_FIRST_EXECUTION_FIELD,
  AUTO_START_ON_START_DATE_FIELD,
} from './constants';
import { milestoneAutomaticStatusMessages as messages } from './messages';

import styles from './milestoneAutomaticStatus.scss';

const cx = createClassnames(styles);

const OPTIONS = [
  {
    name: AUTO_START_ON_START_DATE_FIELD,
    label: messages.startOnStartDate,
    helper: messages.startOnStartDateHelper,
  },
  {
    name: AUTO_START_ON_FIRST_EXECUTION_FIELD,
    label: messages.startOnFirstExecution,
    helper: messages.startOnFirstExecutionHelper,
  },
  {
    name: AUTO_COMPLETE_AFTER_DEADLINE_FIELD,
    label: messages.completeAfterDeadline,
    helper: messages.completeAfterDeadlineHelper,
  },
];

type OptionCheckboxProps = WrappedFieldProps & {
  label: string;
  disabled?: boolean;
};

const OptionCheckbox = ({ input, label, disabled }: OptionCheckboxProps) => (
  <Checkbox
    value={Boolean(input.value)}
    onChange={(event: ChangeEvent<HTMLInputElement>) => input.onChange(event.target.checked)}
    disabled={disabled}
    className={cx('milestone-automatic-status__checkbox')}
  >
    {label}
  </Checkbox>
);

interface MilestoneAutomaticStatusProps {
  disabled?: boolean;
}

export const MilestoneAutomaticStatus = ({ disabled = false }: MilestoneAutomaticStatusProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('milestone-automatic-status')}>
      <span className={cx('milestone-automatic-status__title')}>
        {formatMessage(messages.title)}
      </span>
      <div className={cx('milestone-automatic-status__options')}>
        {OPTIONS.map(({ name, label, helper }) => (
          <div key={name} className={cx('milestone-automatic-status__option')}>
            <Field
              name={name}
              component={OptionCheckbox}
              props={{ label: formatMessage(label), disabled }}
            />
            <span className={cx('milestone-automatic-status__helper')}>
              {formatMessage(helper)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
