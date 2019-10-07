import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import TimeIcon from 'common/img/time-icon-inline.svg';
import { TooltipContent } from 'components/widgets/common/tooltip';
import styles from './mostTimeConsumingTestCasesTooltip.scss';

const cx = classNames.bind(styles);

export const MostTimeConsumingTestCasesTooltip = ({ itemName, duration, date }) => (
  <TooltipContent itemName={itemName}>
    <div className={cx('time-wrapper')}>
      <span className={cx('time-icon')}>{Parser(TimeIcon)}</span>
      <span>{`${duration} ms`}</span>
    </div>
    <div className={cx('date')}>{date}</div>
  </TooltipContent>
);
MostTimeConsumingTestCasesTooltip.propTypes = {
  itemName: PropTypes.string.isRequired,
  duration: PropTypes.number,
  date: PropTypes.string,
};
MostTimeConsumingTestCasesTooltip.defaultProps = {
  itemName: '',
  duration: 0,
  date: '',
};
