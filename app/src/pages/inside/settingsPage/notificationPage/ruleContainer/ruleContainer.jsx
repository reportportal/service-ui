import { InputCheckbox } from 'components/inputs/inputCheckbox';
import classNames from 'classnames/bind';

import styles from './ruleContainer.scss';
import { LineContainer } from '../lineContainer';

const cx = classNames.bind(styles);

const ruleOptions = [
  {
    key: 0,
    lineType: 'inputLine',
    label: 'Recipients',
    notification: '',
    inputData: {
      checkboxText: 'Launch owner (who launched - that received)',
    },
  },
  {
    key: 1,
    lineType: 'inputLine',
    label: 'In case',
    inputData: {
      options: [{ value: 1 }],
    },
  },
  {
    key: 2,
    lineType: 'presetLine',
    label: 'AND',
  },
  {
    key: 3,
    lineType: 'inputLine',
    label: 'Launch names',
    notification: 'Send notifications about selected launches finished',
    inputData: {},
  },
  {
    key: 4,
    lineType: 'presetLine',
    label: 'AND',
  },
  {
    key: 5,
    lineType: 'inputLine',
    label: 'Tags',
    notification: 'Send notifications about launches containing specified tags',
    inputData: {},
  },
  {
    key: 6,
    lineType: 'buttonLine',
    label: '+ Add New Rule',
  },
];

export const RuleContainer = () => (
  <div className={cx('rule')}>
    <div className={cx('rule__checkbox-container')}>
      <InputCheckbox>{'RULE 1'}</InputCheckbox>
    </div>

    {ruleOptions.map((lineOption) => <LineContainer key={lineOption.key} {...lineOption} />)}
  </div>
);
