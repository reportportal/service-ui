import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import classnames from 'classnames';
import styles from './tooltipWrapper.scss';

const cx = classNames.bind(styles);

export const TooltipWrapper = ({ children, className }) => (
  <div className={classnames(cx('tooltip'), className)}>{children}</div>
);

TooltipWrapper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

TooltipWrapper.defaultProps = {
  children: null,
  className: null,
};
