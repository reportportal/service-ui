/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { PRODUCT_BUG, AUTOMATION_BUG, SYSTEM_ISSUE } from 'common/constants/defectTypes';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './infoLine.scss';
import { BarChart } from './barChart';
import { Duration } from './duration';
import { Owner } from './owner';
import { Attributes } from './attributes';
import { Description } from './description';
import { DefectTypeBlock } from './defectTypeBlock';

const cx = classNames.bind(styles);
const messages = defineMessages({
  parent: {
    id: 'InfoLine.parent',
    defaultMessage: 'Parent',
  },
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
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    events: PropTypes.object,
  };
  static defaultProps = {
    events: {},
  };

  render() {
    const {
      intl: { formatMessage },
      events,
      data,
    } = this.props;
    const defects = data.statistics.defects;
    const executions = normalizeExecutions(data.statistics.executions);
    const passed = executions.passed / executions.total * 100 || 0;
    const failed = executions.failed / executions.total * 100 || 0;
    const skipped = executions.skipped / executions.total * 100 || 0;
    const tooltipEventsInfo = {
      [PRODUCT_BUG]: events.PB_TOOLTIP,
      [SYSTEM_ISSUE]: events.SI_TOOLTIP,
      [AUTOMATION_BUG]: events.AB_TOOLTIP,
    };
    return (
      <div className={cx('info-line')}>
        <div className={cx('parent-holder')}>{formatMessage(messages.parent)}:</div>
        <div className={cx('icon-holder')}>
          <Duration
            status={data.status}
            startTime={data.startTime}
            endTime={data.endTime}
            approxTime={data.approximateDuration}
          />
        </div>
        {data.owner && (
          <div className={cx('icon-holder')}>
            <Owner owner={data.owner} />
          </div>
        )}
        {data.attributes.length > 0 && (
          <div className={cx('icon-holder')}>
            <Attributes attributes={data.attributes} />
          </div>
        )}
        {data.description && (
          <div className={cx('icon-holder')}>
            <Description description={data.description} />
          </div>
        )}
        <div className={cx('bar-chart-holder')}>
          <BarChart passed={passed} failed={failed} skipped={skipped} />
        </div>
        <div className={cx('passed')}>
          {formatMessage(messages.passed, { value: passed.toFixed(2) })}
        </div>
        <div className={cx('total')}>
          {formatMessage(messages.total, { value: executions.total })}
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
