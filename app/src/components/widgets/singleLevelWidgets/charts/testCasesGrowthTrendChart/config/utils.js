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

import { defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import moment from 'moment';
import { TIMELINE_TOOLTIP_DATE_FORMAT } from '../../launchStatisticsChart/constants';
import { TOOLTIP_DATE_FORMAT } from '../../common/trendLineChart/trendChartDesignStyles';
import styles from '../testCasesGrowthTrendChart.scss';

const cx = classNames.bind(styles);

const toTimestamp = (value) =>
  /^\d+$/.test(String(value)) ? Number(value) : new Date(value).getTime();

const localMessages = defineMessages({
  growTestCases: {
    id: 'Widgets.growtestCases',
    defaultMessage: 'Grow test cases',
  },
  totalTestCases: {
    id: 'Widgets.totalTestCases',
    defaultMessage: 'Total test cases',
  },
});

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, positiveTrend, isTimeline, formatMessage } = customProps;
  const { name, number, startTime, date } = itemsData[data[0].index];

  let total;
  let growth;
  if (positiveTrend[data[0].index]) {
    growth = data[1].value;
    total = data[0].value + data[1].value;
  } else {
    growth = -data[1].value;
    total = data[0].value;
  }

  const growthClass = classNames({
    increase: growth > 0,
    decrease: growth < 0,
  });

  return {
    itemName: isTimeline ? moment(date).format(TIMELINE_TOOLTIP_DATE_FORMAT) : `${name} #${number}`,
    startTime: isTimeline ? '' : moment(toTimestamp(startTime)).format(TOOLTIP_DATE_FORMAT),
    wrapperClassName: cx('tooltip'),
    growth,
    growthClass,
    total,
    growTestCasesMessage: formatMessage(localMessages.growTestCases),
    totalTestCasesMessage: formatMessage(localMessages.totalTestCases),
  };
};
