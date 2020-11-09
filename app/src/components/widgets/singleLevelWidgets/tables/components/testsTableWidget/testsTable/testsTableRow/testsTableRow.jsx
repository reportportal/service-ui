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
import { func, string, number, array, object, oneOfType } from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { AbsRelTime } from 'components/main/absRelTime';
import { PTTest } from '../../pTypes';
import { Count } from '../count';
import styles from './testsTableRow.scss';

const cx = classNames.bind(styles);

@injectIntl
export class TestsTableRow extends Component {
  static propTypes = {
    intl: object.isRequired,
    data: PTTest.isRequired,
    name: string.isRequired,
    time: oneOfType([number, array]).isRequired,
    count: number,
    matrixData: array,
    matrixComponent: func,
    status: array,
    duration: number,
    getMaxtrixTooltip: func,
    onItemClick: func,
  };

  static defaultProps = {
    count: null,
    matrixData: null,
    matrixComponent: null,
    status: null,
    duration: null,
    getMaxtrixTooltip: null,
    onItemClick: null,
  };

  itemClickHandler = () => {
    const { onItemClick, data } = this.props;

    if (onItemClick) {
      onItemClick(data.id || data.uniqueId);
    }
  };

  render() {
    const {
      data,
      name,
      time,
      count,
      matrixData,
      matrixComponent: Matrix,
      status,
      duration,
      getMaxtrixTooltip,
      intl: { formatMessage },
    } = this.props;
    const { total, uniqueId } = data;
    const percentage = count !== null ? ((count / total) * 100).toFixed(2) : null;
    const matrixTooltip = getMaxtrixTooltip && getMaxtrixTooltip(count, total, formatMessage);

    return (
      <div className={cx('row')}>
        <div className={cx('col', 'col-name')} onClick={this.itemClickHandler}>
          <span>{name}</span>
        </div>
        {Matrix && count && (
          <div className={cx('col', 'col-count')} title={matrixTooltip}>
            <Count count={count} total={total} />
            <Matrix tests={matrixData} id={uniqueId} />
          </div>
        )}
        {percentage && <div className={cx('col', 'col-percents')}>{percentage}%</div>}
        {status && <div className={cx('col', 'col-status')}>{status}</div>}
        {duration && <div className={cx('col', 'col-duration')}>{duration}</div>}
        <div className={cx('col', 'col-date')}>
          <AbsRelTime startTime={Array.isArray(time) ? time[time.length - 1] : time} />
        </div>
      </div>
    );
  }
}
