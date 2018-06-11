import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './progressLoader.scss';

const cx = classNames.bind(styles);

export const ProgressLoader = ({ progress }) => (
  <div className={cx('progress-bar')}>
    <div className={cx('progress-indicator')} style={{ width: `${progress}%` }} />
  </div>
);

ProgressLoader.propTypes = {
  progress: PropTypes.number,
};

ProgressLoader.defaultProps = {
  progress: 0,
};
