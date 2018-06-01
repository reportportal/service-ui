import React, { Component } from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { getDuration, dateFormat } from 'common/utils';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import ClockIcon from './img/clock-icon-inline.svg';
import styles from './durationInfoBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  finished: {
    id: 'DurationBlock.finished',
    defaultMessage: 'Duration: { durationTime }. Finish time: { endTime }',
  },
});

@injectIntl
export class DurationInfoBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    timing: PropTypes.shape({
      start: PropTypes.number,
      end: PropTypes.number,
      approxTime: PropTypes.number,
    }).isRequired,
  };

  getStatusTitle = () => {
    const { intl, timing } = this.props;
    const durationTime = getDuration(timing.start, timing.end);
    const endTime = dateFormat(timing.end, true);

    return intl.formatMessage(messages.finished, { durationTime, endTime });
  };

  render() {
    return (
      <div className={cx('duration-block')} title={this.getStatusTitle()}>
        <div className={cx('icon')}>{Parser(ClockIcon)}</div>
        <span className={cx('duration')}>
          {getDuration(this.props.timing.start, this.props.timing.end)}
        </span>
      </div>
    );
  }
}
