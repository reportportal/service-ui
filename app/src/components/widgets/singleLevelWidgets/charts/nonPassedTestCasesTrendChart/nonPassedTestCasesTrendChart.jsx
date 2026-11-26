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
import { FAILED, SKIPPED, INTERRUPTED } from 'common/constants/testStatuses';
import { COLOR_CHART_NON_PASSED } from 'common/constants/colors';
import { TrendLineChart } from '../common/trendLineChart/trendLineChart';
import { getOption, getAxesUpdate } from './config/getOption';

const FAILED_SKIPPED_STATISTICS_KEY = 'statistics$executions$failedSkippedTotal';
const STATUSES_LINK_PARAMS = { statuses: [FAILED, SKIPPED, INTERRUPTED], types: null };

export const NonPassedTestCasesTrendChart = (props) => (
  <TrendLineChart
    {...props}
    getOption={getOption}
    getAxesUpdate={getAxesUpdate}
    statusesLinkParams={STATUSES_LINK_PARAMS}
    legendItem={FAILED_SKIPPED_STATISTICS_KEY}
    legendColor={COLOR_CHART_NON_PASSED}
  />
);

NonPassedTestCasesTrendChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
};
