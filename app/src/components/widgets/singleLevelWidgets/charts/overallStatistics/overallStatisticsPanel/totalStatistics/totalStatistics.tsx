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

import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { messages } from 'components/widgets/common/messages';
import { ProgressBar } from './progressBar';
import styles from './totalStatistics.scss';

const cx = classNames.bind(styles);

interface TotalStatisticsProps {
  values: Record<string, number>;
  onChartClick: (...statuses: string[]) => void;
  separateInterrupted?: boolean;
  isPreview?: boolean;
}

export const TotalStatistics = ({
  values,
  onChartClick,
  separateInterrupted = false,
  isPreview = false,
}: TotalStatisticsProps) => {
  const { formatMessage } = useIntl();
  const total = values.statistics$executions$total;
  const passed = values.statistics$executions$passed;
  const failed = values.statistics$executions$failed;
  const skipped = values.statistics$executions$skipped;
  const interrupted = values.statistics$executions$interrupted ?? 0;

  return (
    <div className={cx('container', { preview: isPreview })}>
      {total >= 0 && (
        <div>
          <div className={cx('total')}>
            <div className={cx('amount')}>{total}</div>

            <div>
              {isPreview
                ? formatMessage(messages.totalCaption)
                : formatMessage(messages.testCasesCaption, { count: total })}
            </div>
          </div>
          {!isPreview && (
            <ProgressBar
              onChartClick={onChartClick}
              values={values}
              separateInterrupted={separateInterrupted}
            />
          )}
        </div>
      )}

      <div className={cx('details')}>
        <div className={cx('details-row')}>
          {passed >= 0 && (
            <div className={cx('details-item')}>
              <div className={cx('amount', 'amount-passed')}>{passed}</div>
              <div className={cx('label')}>
                <div className={cx('marker', 'passed')} /> {formatMessage(messages.passed)}
              </div>
            </div>
          )}
          {failed >= 0 && (
            <div className={cx('details-item')}>
              <div className={cx('amount', 'amount-failed')}>{failed}</div>
              <div className={cx('label')}>
                <div className={cx('marker', 'failed')} /> {formatMessage(messages.failed)}
              </div>
            </div>
          )}
          {skipped >= 0 && (
            <div className={cx('details-item')}>
              <div className={cx('amount', 'amount-skipped')}>{skipped}</div>
              <div className={cx('label')}>
                <div className={cx('marker')} /> {formatMessage(messages.skipped)}
              </div>
            </div>
          )}
        </div>
        {separateInterrupted && (
          <div className={cx('details-row')}>
            <div className={cx('details-item')}>
              <div className={cx('amount', 'amount-interrupted')}>{interrupted}</div>
              <div className={cx('label')}>
                <div className={cx('marker', 'interrupted')} />{' '}
                {formatMessage(messages.interrupted)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
