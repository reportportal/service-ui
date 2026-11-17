/*
 * Copyright 2025 EPAM Systems
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

import { createClassnames } from 'common/utils';
import { DropdownWithDescription } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/dropdownWithDescription';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { commonMessages } from 'pages/inside/common/common-messages';

import { messages } from '../createTestCaseModal/basicInformation/messages';

import styles from './prioritySelect.scss';

const cx = createClassnames(styles);

interface PrioritySelectProps {
  value?: string;
  onChange?: (value: string) => void;
}
export const PrioritySelect = ({ value, onChange }: PrioritySelectProps) => {
  const { formatMessage } = useIntl();

  return (
    <DropdownWithDescription
      label={formatMessage(commonMessages.priority)}
      value={value}
      onChange={onChange}
      options={[
        {
          label: formatMessage(messages.priorityBlocker),
          value: 'blocker',
          icon: (
            <PriorityIcon priority="blocker" className={cx('priority-select__priority-icon')} />
          ),
        },
        {
          label: formatMessage(messages.priorityCritical),
          value: 'critical',
          icon: (
            <PriorityIcon priority="critical" className={cx('priority-select__priority-icon')} />
          ),
        },
        {
          label: formatMessage(messages.priorityHigh),
          value: 'high',
          icon: <PriorityIcon priority="high" className={cx('priority-select__priority-icon')} />,
        },
        {
          label: formatMessage(messages.priorityMedium),
          value: 'medium',
          icon: <PriorityIcon priority="medium" className={cx('priority-select__priority-icon')} />,
        },
        {
          label: formatMessage(messages.priorityLow),
          value: 'low',
          icon: <PriorityIcon priority="low" className={cx('priority-select__priority-icon')} />,
        },
        {
          label: formatMessage(messages.priorityUnspecified),
          value: 'unspecified',
          icon: (
            <PriorityIcon priority="unspecified" className={cx('priority-select__priority-icon')} />
          ),
        },
      ]}
    />
  );
};
