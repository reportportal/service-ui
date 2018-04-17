import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './emptyLayout.scss';

const cx = classNames.bind(styles);

export const EmptyLayout = ({ children }) => <div className={cx('empty-layout')}>{children}</div>;

EmptyLayout.propTypes = {
  children: PropTypes.node,
};
EmptyLayout.defaultProps = {
  children: null,
};
