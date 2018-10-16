import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './tooltipWrapper.scss';

const cx = classNames.bind(styles);

export const TooltipWrapper = ({ children }) => <div className={cx('tooltip')}>{children}</div>;

TooltipWrapper.propTypes = {
  children: PropTypes.node,
};

TooltipWrapper.defaultProps = {
  children: null,
};
