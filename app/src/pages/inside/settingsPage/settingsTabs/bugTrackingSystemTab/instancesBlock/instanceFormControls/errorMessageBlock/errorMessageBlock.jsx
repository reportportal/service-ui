import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './errorMessageBlock.scss';

const cx = classNames.bind(styles);

export const ErrorMessageBlock = ({ message }) => (
  <div className={cx('error-message-block')}>{message}</div>
);
ErrorMessageBlock.propTypes = {
  message: PropTypes.string,
};
ErrorMessageBlock.defaultProps = {
  message: '',
};
