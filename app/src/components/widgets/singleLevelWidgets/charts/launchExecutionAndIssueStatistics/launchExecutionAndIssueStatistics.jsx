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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { LaunchExecutionChart } from './launchExecutionChart';
import { IssueStatisticsChart } from './issueStatisticsChart';
import styles from './launchExecutionAndIssueStatistics.scss';

const cx = classNames.bind(styles);
const launchNameBlockHeight = 40;

const localMessages = defineMessages({
  launchNameText: {
    id: 'LaunchExecutionAndIssueStatistics.launchNameText',
    defaultMessage: 'Launch name:',
  },
});

export const LaunchExecutionAndIssueStatistics = injectIntl((props) => {
  const {
    widget: {
      content: { result = [] },
    },
    onStatusPageMode,
    isPreview,
  } = props;
  const { name, number } = result[0];
  const launchName = number ? `${name} #${number}` : name;
  const isLaunchNameBlockNeeded = !isPreview && launchName && !onStatusPageMode;
  const heightOffset = isLaunchNameBlockNeeded ? launchNameBlockHeight : 0;

  return (
    <div className={cx('launch-execution-and-issues-chart')}>
      {isLaunchNameBlockNeeded && (
        <div className={cx('launch-name-block')}>
          <span className={cx('launch-name-text')}>
            {`${props.intl.formatMessage(localMessages.launchNameText)} `}
          </span>
          <span className={cx('launch-name')}>{launchName}</span>
        </div>
      )}
      <div className={cx('widgets-wrapper', { 'with-launch-name-block': isLaunchNameBlockNeeded })}>
        <div className={cx('chart-container')}>
          <LaunchExecutionChart {...props} heightOffset={heightOffset} />
        </div>
        <div className={cx('chart-container')}>
          <IssueStatisticsChart {...props} heightOffset={heightOffset} />
        </div>
      </div>
    </div>
  );
});

LaunchExecutionAndIssueStatistics.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  uncheckedLegendItems: PropTypes.array,
  onChangeLegend: PropTypes.func,
  onStatusPageMode: PropTypes.bool,
};

LaunchExecutionAndIssueStatistics.defaultProps = {
  isPreview: false,
  height: 0,
  observer: undefined,
  uncheckedLegendItems: [],
  onChangeLegend: () => {},
  onStatusPageMode: false,
};
