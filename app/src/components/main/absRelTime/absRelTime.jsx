import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import {
  setStartTimeFormatAction,
  startTimeFormatSelector,
  START_TIME_FORMAT_RELATIVE,
  START_TIME_FORMAT_ABSOLUTE,
} from 'controllers/user';
import {
  dateFormat,
  fromNowFormat,
} from 'common/utils';
import styles from './absRelTime.scss';

const cx = classNames.bind(styles);

@connect(state => ({
  startTimeFormat: startTimeFormatSelector(state),
}), {
  setStartTimeFormatAction,
})
export class AbsRelTime extends Component {
  static propTypes = {
    startTime: PropTypes.number,
    startTimeFormat: PropTypes.oneOf([
      START_TIME_FORMAT_RELATIVE,
      START_TIME_FORMAT_ABSOLUTE,
    ]),
    setStartTimeFormatAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    startTime: 0,
    startTimeFormat: START_TIME_FORMAT_RELATIVE,
  };

  toggleFormat = () => {
    this.props.setStartTimeFormatAction(
      this.isRelative() ? START_TIME_FORMAT_ABSOLUTE : START_TIME_FORMAT_RELATIVE,
    );
  };

  isRelative = () => this.props.startTimeFormat === START_TIME_FORMAT_RELATIVE;

  render() {
    return (
      <div className={cx('abs-rel-time', { relative: this.isRelative() })} onClick={this.toggleFormat}>
        <span className={cx('relative-time')}>
          {fromNowFormat(this.props.startTime)}
        </span>
        <span className={cx('absolute-time')}>
          {dateFormat(this.props.startTime)}
        </span>
      </div>
    );
  }
}
