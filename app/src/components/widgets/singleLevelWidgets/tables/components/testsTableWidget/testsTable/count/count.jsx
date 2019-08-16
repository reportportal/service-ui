import * as React from 'react';
import { number } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './count.scss';

const cx = classNames.bind(styles);

export const Count = ({ count, total }) => (
  <div className={cx('count')}>
    {count} <FormattedMessage id="Common.of" defaultMessage="of" /> {total}
  </div>
);

Count.propTypes = {
  count: number.isRequired,
  total: number.isRequired,
};
