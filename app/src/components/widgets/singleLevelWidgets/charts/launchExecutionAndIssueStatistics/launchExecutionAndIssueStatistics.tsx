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

import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import { LaunchExecutionChart } from './launchExecutionChart';
import { IssueStatisticsChart } from './issueStatisticsChart';
import styles from './launchExecutionAndIssueStatistics.scss';

const cx = classNames.bind(styles);
const launchNameBlockHeight = 28;

const localMessages = defineMessages({
  launchNameText: {
    id: 'LaunchExecutionAndIssueStatistics.launchNameText',
    defaultMessage: 'Launch name:',
  },
});

export interface LaunchExecutionAndIssueStatisticsProps {
  widget: {
    content: {
      result?: { name: string; number?: number }[];
    };
  };
  container?: Element;
  isPreview?: boolean;
  observer?: unknown;
  uncheckedLegendItems?: string[];
  onChangeLegend?: () => void;
  onStatusPageMode?: boolean;
}

export const LaunchExecutionAndIssueStatistics = (
  props: LaunchExecutionAndIssueStatisticsProps,
) => {
  const {
    widget: {
      content: { result = [] },
    },
    onStatusPageMode = false,
    isPreview = false,
  } = props;
  const { formatMessage } = useIntl();
  const { name, number } = result[0];
  const launchName = number ? `${name} #${number}` : name;
  const isLaunchNameBlockNeeded = !isPreview && launchName && !onStatusPageMode;
  const heightOffset = isLaunchNameBlockNeeded ? launchNameBlockHeight : 0;

  return (
    <div className={cx('launch-execution-and-issues-chart')}>
      {isLaunchNameBlockNeeded && (
        <div className={cx('launch-name-block')}>
          <span className={cx('launch-name-text')}>
            {formatMessage(localMessages.launchNameText)}
          </span>
          <span className={cx('launch-name')}>{launchName}</span>
        </div>
      )}
      <div className={cx('widgets-wrapper')}>
        <div className={cx('chart-container')}>
          <LaunchExecutionChart {...props} heightOffset={heightOffset} />
        </div>
        <div className={cx('chart-container')}>
          <IssueStatisticsChart {...props} heightOffset={heightOffset} />
        </div>
      </div>
    </div>
  );
};
