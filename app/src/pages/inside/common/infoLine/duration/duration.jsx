import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import { DurationTooltip } from './durationTooltip';
import styles from './duration.scss';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: DurationTooltip,
  data: {
    width: 420,
    align: 'left',
    noArrow: true,
  },
})
export class Duration extends Component {
  static propTypes = {
    status: PropTypes.string,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    approxTime: PropTypes.number,
  };

  static defaultProps = {
    status: '',
    startTime: null,
    endTime: null,
    approxTime: null,
  };

  render() {
    const { status, startTime, endTime, approxTime } = this.props;
    return (
      <span className={cx('duration-block')}>
        <DurationBlock
          status={status}
          timing={{
            start: startTime,
            end: endTime,
            approxTime,
          }}
          iconClass={cx('icon')}
          durationClass={cx('duration')}
        />
      </span>
    );
  }
}
