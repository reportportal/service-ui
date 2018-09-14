import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import styles from './infoLine.scss';
import { BarChart } from './barChart';
import { Duration } from './duration';
import { DefectTypeBlock } from './defectTypeBlock';
import { getDuration } from '../../../../common/utils/timeDateUtils';

const cx = classNames.bind(styles);
const messages = defineMessages({
  passed: {
    id: 'InfoLine.passed',
    defaultMessage: 'Passed {value}%',
  },
  total: {
    id: 'InfoLine.total',
    defaultMessage: 'Total {value}',
  },
});

@injectIntl
export class InfoLine extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  render() {
    const { formatMessage } = this.props.intl;
    const defects = this.props.data.statistics.defects;
    const executions = this.props.data.statistics.executions;
    const passed = executions.passed / executions.total * 100;
    const failed = executions.failed / executions.total * 100;
    const skipped = executions.skipped / executions.total * 100;
    const endTime = this.props.data.end_time;
    const startTime = this.props.data.start_time;
    const duration = getDuration(startTime, endTime);
    return (
      <div className={cx('info-line')}>
        <div className={cx('bar-chart-holder')}>
          <BarChart passed={passed} failed={failed} skipped={skipped} />
        </div>
        <div className={cx('passed')}>
          {formatMessage(messages.passed, { value: passed.toFixed(2) })}
        </div>
        <div className={cx('total')}>
          {formatMessage(messages.total, { value: executions.total })}
        </div>
        <div className={cx('duration')}>
          <FormattedMessage id="InfoLine.duration" defaultMessage="Duration" />
          <div className={cx('duration-value')}>
            <Duration duration={duration} />
          </div>
        </div>
        <div className={cx('defect-types')}>
          {Object.keys(defects).map((key) => (
            <div key={key} className={cx('defect-type')}>
              <DefectTypeBlock itemId={this.props.data.id} type={key} data={defects[key]} />
            </div>
          ))}
        </div>
      </div>
    );
  }
}
