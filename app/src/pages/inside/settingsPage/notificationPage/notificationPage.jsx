import React from 'react';
import classNames from 'classnames/bind';

import styles from './notificationPage.scss';

import { LineContainer } from './lineContainer';
import { RuleContainer } from './ruleContainer';
import { ButtonLine } from './lineContainer/lines';

const cx = classNames.bind(styles);

const options = [
  {
    label: 'ON',
    value: 'ON',
  },
  {
    label: 'OFF',
    value: 'OFF',
  },
];

const firstLineOption = {
  key: 0,
  lineType: 'inputLine',
  label: 'E-mail notifications',
  notification: 'Send e-mail notifications about launches finished',
  inputData: {
    options,
  },
};

const secondLineOption = {
  key: 1,
  lineType: 'inputLine',
  isLabelRequired: true,
  label: 'From',
  notification: '',
  inputData: {},
};

const optionLines = [firstLineOption, secondLineOption];

export const NotificationPage = () => (
  <div className={cx('page-container')}>
    {optionLines.map((lineOptions) => <LineContainer key={lineOptions.key} {...lineOptions} />)}
    <RuleContainer />
    <ButtonLine label={'Submit'} isSubmitButton />
  </div>
);
