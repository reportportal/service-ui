import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { formatValue } from 'common/utils';
import styles from './timelineTooltip.scss';

const cx = classNames.bind(styles);

export const TimelineTooltip = ({ date, itemCases, color, itemName }) => (
  <React.Fragment>
    <div className={cx('launch-start-time')}>{date}</div>
    <div className={cx('item-wrapper')}>
      <span className={cx('color-mark')} style={{ backgroundColor: color }} />
      <span className={cx('item-name')}>{`${itemName}:`}</span>
      <span className={cx('item-cases')}>
        <span>{`${formatValue(itemCases)}%`}</span>
      </span>
    </div>
  </React.Fragment>
);
TimelineTooltip.propTypes = {
  date: PropTypes.string.isRequired,
  itemCases: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  itemName: PropTypes.string.isRequired,
};
