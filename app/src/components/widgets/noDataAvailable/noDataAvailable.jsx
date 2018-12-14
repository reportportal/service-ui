import React from 'react';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './noDataAvailable.scss';

const cx = classNames.bind(styles);

export const NoDataAvailable = () => (
  <div className={cx('no-data-available')}>
    <FormattedMessage id="NoDataAvailable.noDataMessage" defaultMessage="No data available." />
  </div>
);
