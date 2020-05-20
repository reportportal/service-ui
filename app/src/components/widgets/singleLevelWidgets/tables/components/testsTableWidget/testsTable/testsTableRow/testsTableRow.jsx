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

import { Component } from 'react';
import PropTypes, { func, string, number, array, object, oneOfType } from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { testCaseNameLinkSelector } from 'controllers/testItem';
import { AbsRelTime } from 'components/main/absRelTime';
import { NavLink } from 'components/main/navLink';
import { FLAKY_TEST_CASES_TABLE } from 'common/constants/widgetTypes';
import { PTTest } from '../../pTypes';
import { Count } from '../count';
import styles from './testsTableRow.scss';

const cx = classNames.bind(styles);

const titleMessages = defineMessages({
  [FLAKY_TEST_CASES_TABLE]: {
    id: 'TestTableRow.flakyTestCasesTitle',
    defaultMessage: '{statusNumber} {statusChange} from {possibleNumber} {possibleTimes}',
  },
  change: {
    id: 'TestTableRow.flakyTestCasesTitleChange',
    defaultMessage: 'status change',
  },
  changes: {
    id: 'TestTableRow.flakyTestCasesTitleChanges',
    defaultMessage: 'status changes',
  },
  possible: {
    id: 'TestTableRow.flakyTestCasesTitlePossible',
    defaultMessage: 'possible',
  },
  possibleTimes: {
    id: 'TestTableRow.flakyTestCasesTitlePossibleTimes',
    defaultMessage: 'possible times',
  },
});

@injectIntl
@connect((state, ownProps) => ({
  testCaseNameLink: testCaseNameLinkSelector(state, {
    uniqueId: ownProps.data.uniqueId,
    testItemIds: ownProps.launchId,
  }),
}))
export class TestsTableRow extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    launchId: oneOfType([number, string]).isRequired,
    testCaseNameLink: object.isRequired,
    data: PTTest.isRequired,
    name: string.isRequired,
    time: oneOfType([number, array]).isRequired,
    count: number,
    matrixData: array,
    matrixComponent: func,
    status: array,
    duration: number,
    widgetType: string,
  };

  static defaultProps = {
    count: null,
    matrixData: null,
    matrixComponent: null,
    status: null,
    duration: null,
    widgetType: '',
  };

  render() {
    const {
      testCaseNameLink,
      data,
      name,
      time,
      count,
      matrixData,
      matrixComponent: Matrix,
      status,
      duration,
      widgetType,
      intl: { formatMessage },
    } = this.props;
    const { total, uniqueId } = data;
    const percentage = count !== null ? ((count / total) * 100).toFixed(2) : null;

    return (
      <div className={cx('row')}>
        <NavLink className={cx('col', 'col-name')} to={testCaseNameLink}>
          <span>{name}</span>
        </NavLink>
        {Matrix && count && (
          <div
            className={cx('col', 'col-count')}
            title={
              widgetType
                ? formatMessage(titleMessages[widgetType], {
                    statusNumber: count,
                    statusChange: formatMessage(
                      count === 1 ? titleMessages.change : titleMessages.changes,
                    ),
                    possibleTimes: formatMessage(
                      total === 1 ? titleMessages.possible : titleMessages.possibleTimes,
                    ),
                    possibleNumber: total,
                  })
                : ''
            }
          >
            <Count count={count} total={total} />
            <Matrix tests={matrixData} id={uniqueId} />
          </div>
        )}
        {percentage && <div className={cx('col', 'col-percents')}>{percentage}%</div>}
        {status && <div className={cx('col', 'col-status')}>{status}</div>}
        {duration && <div className={cx('col', 'col-duration')}>{duration} s</div>}
        <div className={cx('col', 'col-date')}>
          <AbsRelTime startTime={Array.isArray(time) ? time[time.length - 1] : time} />
        </div>
      </div>
    );
  }
}
