import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './ownerTooltip.scss';

const cx = classNames.bind(styles);

export const OwnerTooltip = ({ owner }) => <div className={cx('owner-tooltip')}>{owner}</div>;
OwnerTooltip.propTypes = {
  owner: PropTypes.string,
};

OwnerTooltip.defaultProps = {
  owner: '',
};
