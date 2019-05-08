import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { getDuration } from 'common/utils/timeDateUtils';
import { PRODUCT_BUG, AUTOMATION_BUG, SYSTEM_ISSUE } from 'common/constants/defectTypes';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import styles from './infoLine.scss';
import { BarChart } from './barChart';
import { Duration } from './duration';
import { DefectTypeBlock } from './defectTypeBlock';

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

const normalizeExecutions = (executions) => ({
  total: executions.total || 0,
  passed: executions.passed || 0,
  failed: executions.failed || 0,
  skipped: executions.skipped || 0,
});

@injectIntl
export class InfoLine extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    events: PropTypes.object,
  };
  static defaultProps = {
    events: {},
  };

  render() {
    const { events } = this.props;
    const { formatMessage } = this.props.intl;
    const defects = this.props.data.statistics.defects;
    const executions = normalizeExecutions(this.props.data.statistics.executions);
    const passed = executions.passed / executions.total * 100 || 0;
    const failed = executions.failed / executions.total * 100 || 0;
    const skipped = executions.skipped / executions.total * 100 || 0;
    const endTime = this.props.data.endTime;
    const startTime = this.props.data.startTime;
    const duration = getDuration(startTime, endTime);
    const tooltipEventsInfo = {
      [PRODUCT_BUG]: events.PB_TOOLTIP,
      [SYSTEM_ISSUE]: events.SI_TOOLTIP,
      [AUTOMATION_BUG]: events.AB_TOOLTIP,
    };
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
              <DefectTypeBlock
                type={key}
                data={defects[key]}
                tooltipEventInfo={tooltipEventsInfo[key]}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}
