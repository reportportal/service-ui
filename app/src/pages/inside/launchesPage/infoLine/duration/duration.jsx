import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './duration.scss';
import { DurationTooltip } from './durationTooltip';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: DurationTooltip,
  data: { width: 420, leftOffset: 150, noArrow: true },
})
export class Duration extends Component {
  static propTypes = {
    duration: PropTypes.string.isRequired,
  };

  render() {
    return (
      <span className={cx('duration')}>{ this.props.duration }</span>
    );
  }
}
