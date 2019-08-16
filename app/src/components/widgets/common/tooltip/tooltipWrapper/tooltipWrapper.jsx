import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './tooltipWrapper.scss';

const cx = classNames.bind(styles);

export const TooltipWrapper = ({ children, className }) => (
  <div className={cx('tooltip-wrapper', className)}>{children}</div>
);

TooltipWrapper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

TooltipWrapper.defaultProps = {
  children: null,
  className: null,
};
