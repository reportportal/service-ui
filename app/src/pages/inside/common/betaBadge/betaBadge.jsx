import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './betaBadge.scss';

const cx = classNames.bind(styles);

export const BetaBadge = ({ className }) => (
  <span className={cx('beta-badge', className)}>
    <FormattedMessage id="BetaBadge.beta" defaultMessage="beta" />
  </span>
);

BetaBadge.propTypes = {
  className: PropTypes.string,
};
BetaBadge.defaultProps = {
  className: '',
};
