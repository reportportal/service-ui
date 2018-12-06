import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './TooltipPassingContent.scss';

const cx = classNames.bind(styles);

export const TooltipPassingContent = ({ launchPercent, launchNumber, color, itemName }) => (
  <React.Fragment>
    <div className={cx('launch-name')}>{`${launchNumber} (${launchPercent}%)`}</div>
    <div className={cx('item-wrapper')}>
      <span className={cx('color-mark')} style={{ backgroundColor: color }} />
      <span className={cx('item-name')}>{`${itemName}`}</span>
    </div>
  </React.Fragment>
);

TooltipPassingContent.propTypes = {
  launchPercent: PropTypes.string,
  launchNumber: PropTypes.number,
  itemName: PropTypes.string,
  color: PropTypes.string.isRequired,
};

TooltipPassingContent.defaultProps = {
  launchPercent: '',
  launchNumber: 0,
  itemName: '',
};
