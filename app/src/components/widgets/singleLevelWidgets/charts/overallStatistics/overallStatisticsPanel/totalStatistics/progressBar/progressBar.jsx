/*
 * Copyright 2026 EPAM Systems
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

import PropTypes from 'prop-types';
import { Fragment } from 'react';
import classNames from 'classnames/bind';
import { FAILED, INTERRUPTED, SKIPPED, PASSED } from 'common/constants/testStatuses';
import styles from './progressBar.scss';

const cx = classNames.bind(styles);

export class ProgressBar extends React.PureComponent {
  static propTypes = {
    progressData: PropTypes.object.isRequired,
    onChartClick: PropTypes.func.isRequired,
  };

  static getPercentage = (value, totalVal) => {
    if (!totalVal || totalVal <= 0) {
      return '0%';
    }
    return `${(value / totalVal) * 100}%`;
  };

  render() {
    const {
      total,
      passed,
      failed,
      skipped,
      interrupted = 0,
      separateInterrupted,
    } = this.props.progressData;
    const { getPercentage } = ProgressBar;

    return (
      <div className={cx('container')}>
        <div
          onClick={() => this.props.onChartClick(PASSED)}
          style={{ width: getPercentage(passed, total) }}
          className={cx('passed')}
        />
        {separateInterrupted ? (
          <Fragment>
            <div
              onClick={() => this.props.onChartClick(FAILED)}
              style={{ width: getPercentage(failed, total) }}
              className={cx('failed')}
            />
            <div
              onClick={() => this.props.onChartClick(INTERRUPTED)}
              style={{ width: getPercentage(interrupted, total) }}
              className={cx('interrupted')}
            />
          </Fragment>
        ) : (
          <div
            onClick={() => this.props.onChartClick(FAILED, INTERRUPTED)}
            style={{ width: getPercentage(failed, total) }}
            className={cx('failed')}
          />
        )}
        <div
          onClick={() => this.props.onChartClick(SKIPPED)}
          style={{ width: getPercentage(skipped, total) }}
          className={cx('skipped')}
        />
      </div>
    );
  }
}
