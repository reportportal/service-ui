import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { TooltipWrapper } from '../tooltipWrapper';
import styles from './tooltipContent.scss';

const cx = classNames.bind(styles);

export const TooltipContent = ({ itemName, wrapperClassName, children }) => (
  <TooltipWrapper className={wrapperClassName}>
    {itemName && <div className={cx('item-name')}>{itemName}</div>}
    {children}
  </TooltipWrapper>
);
TooltipContent.propTypes = {
  itemName: PropTypes.string,
  wrapperClassName: PropTypes.string,
  children: PropTypes.node,
};
TooltipContent.defaultProps = {
  itemName: '',
  wrapperClassName: '',
  children: null,
};
