import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { TooltipContent } from 'components/widgets/common/tooltip';
import styles from './testCasesGrowthTrendChartTooltip.scss';

const cx = classNames.bind(styles);

export const TestCasesGrowthTrendChartTooltip = ({
  itemName,
  startTime,
  growthClass,
  growth,
  total,
  growTestCasesMessage,
  totalTestCasesMessage,
}) => (
  <TooltipContent itemName={itemName}>
    {startTime && <div className={cx('launch-start-time')}>{startTime}</div>}
    <div className={cx('item-wrapper')}>
      <div className={cx('item-cases')}>
        <div className={cx('item-cases-growth')}>
          {`${growTestCasesMessage}: `}
          <span className={cx(growthClass)}>{growth}</span>
        </div>
        <div className={cx('item-cases-total')}>
          {`${totalTestCasesMessage}: `}
          <span>{total}</span>
        </div>
      </div>
    </div>
  </TooltipContent>
);
TestCasesGrowthTrendChartTooltip.propTypes = {
  itemName: PropTypes.string.isRequired,
  startTime: PropTypes.string,
  growthClass: PropTypes.string,
  growth: PropTypes.number,
  total: PropTypes.number,
  growTestCasesMessage: PropTypes.string,
  totalTestCasesMessage: PropTypes.string,
};
TestCasesGrowthTrendChartTooltip.defaultProps = {
  itemName: '',
  startTime: '',
  growthClass: '',
  growth: 0,
  total: 0,
  growTestCasesMessage: '',
  totalTestCasesMessage: '',
};
