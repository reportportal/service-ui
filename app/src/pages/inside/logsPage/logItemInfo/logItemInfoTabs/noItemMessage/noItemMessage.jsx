import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import WarningIcon from 'common/img/warning-inline.svg';
import styles from './noItemMessage.scss';

const cx = classNames.bind(styles);

export const NoItemMessage = ({ message }) => (
  <div className={cx('no-item-message')}>
    <div className={cx('warning-icon')}>{Parser(WarningIcon)}</div>
    <div className={cx('message')}>{message}</div>
  </div>
);

NoItemMessage.propTypes = {
  message: PropTypes.string,
};

NoItemMessage.defaultProps = {
  message: '',
};
