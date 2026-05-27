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
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { messages } from 'components/widgets/common/messages';
import { ProgressBar } from './progressBar';
import styles from './totalStatistics.scss';

const cx = classNames.bind(styles);

@injectIntl
export class TotalStatistics extends React.PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    onChartClick: PropTypes.func.isRequired,
    separateInterrupted: PropTypes.bool,
  };

  static defaultProps = {
    separateInterrupted: false,
  };

  render() {
    const {
      intl: { formatMessage },
      values,
      onChartClick,
      separateInterrupted,
    } = this.props;
    const total = values.statistics$executions$total;
    const passed = values.statistics$executions$passed;
    const failed = values.statistics$executions$failed;
    const skipped = values.statistics$executions$skipped;
    const interrupted = values.statistics$executions$interrupted ?? 0;
    const progressData = {
      total,
      passed,
      failed,
      skipped,
      interrupted,
      separateInterrupted,
    };

    return (
      <div className={cx('container')}>
        {total >= 0 && (
          <div>
            <div className={cx('total')}>
              <div className={cx('amount')}>{total}</div>

              <div>{formatMessage(messages.totalCaption)}</div>
            </div>
            <ProgressBar onChartClick={onChartClick} progressData={progressData} />
          </div>
        )}

        <div className={cx('details')}>
          <div className={cx('details-row')}>
            {passed >= 0 && (
              <div className={cx('details-item')}>
                <div className={cx('amount')}>{passed}</div>

                <div className={cx('label')}>
                  <div className={cx('marker', 'passed')} /> {formatMessage(messages.passed)}
                </div>
              </div>
            )}
            {failed >= 0 && (
              <div className={cx('details-item')}>
                <div className={cx('amount')}>{failed}</div>

                <div className={cx('label')}>
                  <div className={cx('marker', 'failed')} /> {formatMessage(messages.failed)}
                </div>
              </div>
            )}
            {skipped >= 0 && (
              <div className={cx('details-item')}>
                <div className={cx('amount')}>{skipped}</div>

                <div className={cx('label')}>
                  <div className={cx('marker')} /> {formatMessage(messages.skipped)}
                </div>
              </div>
            )}
          </div>
          {separateInterrupted && (
            <div className={cx('details-row', 'details-row-interrupted')}>
              <div className={cx('details-item')}>
                <div className={cx('amount')}>{interrupted}</div>

                <div className={cx('label')}>
                  <div className={cx('marker', 'interrupted')} /> {formatMessage(messages.interrupted)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
