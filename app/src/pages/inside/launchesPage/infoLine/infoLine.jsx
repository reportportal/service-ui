import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
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
    const passed = (executions.passed / executions.total) * 100;
    const failed = (executions.failed / executions.total) * 100;
    const skipped = (executions.skipped / executions.total) * 100;
    return (
      <div className={cx('info-line')}>
        <div className={cx('bar-chart-holder')}>
          <BarChart passed={passed} failed={failed} skipped={skipped} />
        </div>
        <div className={cx('passed')}>
          { formatMessage(messages.passed, { value: passed.toFixed(2) }) }
        </div>
        <div className={cx('total')}>
          { formatMessage(messages.total, { value: executions.total }) }
        </div>
        <div className={cx('duration')}>
          <FormattedMessage id="InfoLine.duration" defaultMessage="Duration" />
          <div className={cx('duration-value')}>
            {/* TODO change on duration calculation */}
            <Duration duration={'7s'} />
          </div>
        </div>
        <div className={cx('defect-types')}>
          {
            Object.keys(defects).map(key => (
              <div key={key} className={cx('defect-type')}>
                <DefectTypeBlock type={key} data={defects[key]} />
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}
