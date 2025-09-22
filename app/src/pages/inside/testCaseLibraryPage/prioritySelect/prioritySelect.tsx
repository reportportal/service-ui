import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';

import { DropdownWithDescription } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/dropdownWithDescription';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { messages } from './messages';

import styles from './prioritySelect.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface PrioritySelectProps {
  value?: string;
  onChange?: (value: string) => void;
}
export const PrioritySelect = ({ value, onChange }: PrioritySelectProps) => {
  const { formatMessage } = useIntl();

  return (
    <DropdownWithDescription
      label={formatMessage(messages.priority)}
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
