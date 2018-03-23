import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './icon.scss';

const cx = classNames.bind(styles);

export const Icon = ({ type }) => (
  <i className={cx('icon', type)} />
);

Icon.propTypes = {
  type: PropTypes.string.isRequired,
};
