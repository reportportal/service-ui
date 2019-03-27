import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './tooltip.scss';

const cx = classNames.bind(styles);

export const CumulativeTrendTooltip = ({ groupName, itemsData }) => (
  <React.Fragment>
    <div className={cx('tooltip-header')}>
      <span className={cx('group-name')}>{groupName}</span>
    </div>
    <div className={cx('tooltip-body')}>
      {itemsData.map((item) => (
        <div key={item.id} className={cx('item-wrapper')}>
          <div className={cx('color-mark')} style={{ backgroundColor: item.color }} />
          <div className={cx('item-name')}>{item.name}</div>
          <div className={cx('item-value')}>{item.value}</div>
        </div>
      ))}
    </div>
  </React.Fragment>
);

CumulativeTrendTooltip.propTypes = {
  groupName: PropTypes.string.isRequired,
  itemsData: PropTypes.array.isRequired,
};
