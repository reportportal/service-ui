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

import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { EChart } from 'components/widgets/common/echarts';
import {
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
} from 'components/widgets/common/utils';
import { statisticsLinkSelector } from 'controllers/testItem';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { FAILED, SKIPPED, INTERRUPTED } from 'common/constants/testStatuses';
import { getOption } from './config/getOption';
import styles from './nonPassedTestCasesTrendChart.scss';

const cx = classNames.bind(styles);

const FAILED_SKIPPED_STATISTICS_KEY = 'statistics$executions$failedSkippedTotal';

export const NonPassedTestCasesTrendChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  heightOffset,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);

  const onChartClick = useCallback(
    (data) => {
      const { organizationSlug, projectSlug } = slugs;
      const launchIds = widget.content.result.map((item) => item.id);
      const link = getStatisticsLink({
        statuses: [FAILED, SKIPPED, INTERRUPTED],
        types: null,
      });
      const navigationParams = getDefaultTestItemLinkParams(
        projectSlug,
        widget.appliedFilters[0].id,
        launchIds[data.index],
        organizationSlug,
      );

      dispatch(Object.assign(link, navigationParams));
    },
    [dispatch, getStatisticsLink, slugs, widget],
  );

  const configData = useMemo(
    () => ({
      getOption,
      onChartClick,
      formatMessage,
    }),
    [formatMessage, onChartClick],
  );

  const legendConfig = useMemo(
    () => ({
      showLegend: true,
      legendProps: {
        items: [FAILED_SKIPPED_STATISTICS_KEY],
        disabled: true,
      },
    }),
    [],
  );

  return (
    <div className={cx('non-passed-cases-trend-chart')}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        configData={configData}
        legendConfig={legendConfig}
      />
    </div>
  );
};

NonPassedTestCasesTrendChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
};
