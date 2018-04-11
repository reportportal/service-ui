import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './icon.scss';

const cx = classNames.bind(styles);

export const Icon = ({ type, onClick }) => <i className={cx('icon', type)} onClick={onClick} />;

Icon.propTypes = {
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

Icon.defaultProps = {
  onClick: () => {},
};
