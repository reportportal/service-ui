import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './barChart.scss';
import { BarChartTooltip } from './barChartTooltip';

const cx = classNames.bind(styles);

@withTooltip({ TooltipComponent: BarChartTooltip, data: { width: 170, align: 'left', noArrow: true } })
export class BarChart extends Component {
  static propTypes = {
    passed: PropTypes.number.isRequired,
    failed: PropTypes.number.isRequired,
    skipped: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div className={cx('bar-chart')}>
        <div className={cx('segment', 'passed')} style={{ width: `${this.props.passed}px` }} />
        <div className={cx('segment', 'failed')} style={{ width: `${this.props.failed}px` }} />
        <div className={cx('segment', 'skipped')} style={{ width: `${this.props.skipped}px` }} />
      </div>
    );
  }
}
