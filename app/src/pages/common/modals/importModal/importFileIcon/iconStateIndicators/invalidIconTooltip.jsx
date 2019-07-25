import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './iconStateIndicators.scss';

const cx = classNames.bind(styles);

export const InvalidIconTooltip = ({ rejectMessage }) => (
  <p className={cx('invalid-tooltip')}> {rejectMessage} </p>
);
InvalidIconTooltip.propTypes = {
  rejectMessage: PropTypes.string,
};
InvalidIconTooltip.defaultProps = {
  rejectMessage: '',
};
