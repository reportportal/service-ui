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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { ALL } from 'common/constants/reservedFilterIds';
import { TEST_ITEMS_TYPE_LIST } from 'controllers/testItem';
import { userFiltersSelector } from 'controllers/project';
import { urlOrganizationAndProjectSelector, TEST_ITEM_PAGE } from 'controllers/pages';
import {
  getItemNameConfig,
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
} from 'components/widgets/common/utils';
import { EChart } from 'components/widgets/common/echarts';
import { getOption } from './config/getOption';
import { isSmallDonutChartView } from './config/utils';
import styles from './donutChart.scss';

const cx = classNames.bind(styles);

export const DonutChart = ({
  widget,
  isPreview = false,
  container,
  observer,
  uncheckedLegendItems = [],
  onChangeLegend = () => {},
  onStatusPageMode = false,
  heightOffset = 0,
  getLink = () => {},
  configParams = {},
  chartText = '',
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const launchFilters = useSelector(userFiltersSelector);

  const chartRef = useRef(null);
  const [isSmallView, setIsSmallView] = useState(false);

  useEffect(() => {
    if (!container || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const updateSmallView = () => {
      setIsSmallView(
        isSmallDonutChartView(container.offsetHeight - heightOffset, container.offsetWidth),
      );
    };

    updateSmallView();

    const resizeObserver = new ResizeObserver(updateSmallView);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [container, heightOffset]);

  const getDefaultItemsTypeListLinkParams = useCallback(
    (activeFilterId) => ({
      payload: {
        projectSlug: slugs.projectSlug,
        filterId: activeFilterId,
        testItemIds: TEST_ITEMS_TYPE_LIST,
        organizationSlug: slugs.organizationSlug,
      },
      type: TEST_ITEM_PAGE,
    }),
    [slugs],
  );

  const onChartClick = useCallback(
    (params) => {
      const {
        appliedFilters,
        contentParameters,
        content: { result = [] },
      } = widget;
      const nameConfig = getItemNameConfig(params.name);
      const id = (result[0] || result).id;
      let navigationParams;
      let linkParams;

      if (!id) {
        const appliedWidgetFilterId = appliedFilters[0].id;
        const launchesLimit = contentParameters.itemsCount;
        const isLatest = contentParameters.widgetOptions.latest;
        const activeFilter = launchFilters.find((filter) => filter.id === appliedWidgetFilterId);
        const activeFilterId = activeFilter?.id || appliedWidgetFilterId;

        linkParams = { isListType: true, launchesLimit, isLatest };
        navigationParams = getDefaultItemsTypeListLinkParams(activeFilterId);
      } else {
        linkParams = { isListType: false, itemId: id };
        navigationParams = getDefaultTestItemLinkParams(
          slugs.projectSlug,
          ALL,
          id,
          slugs.organizationSlug,
        );
      }

      const link = getLink(nameConfig, linkParams);

      dispatch(Object.assign(link, navigationParams));
    },
    [dispatch, getDefaultItemsTypeListLinkParams, getLink, launchFilters, slugs, widget],
  );

  const onChartCreated = useCallback((node, chart) => {
    chartRef.current = chart;
  }, []);

  // Registered separately (not inside `onChartCreated`, which the EChart wrapper
  // only invokes once, on chart creation) so the handler never closes over a
  // stale `widget`/`launchFilters`. Reads `params.name` directly: a donut has
  // one series with many data points, so the generic wrapper's seriesId-first
  // id resolution would otherwise resolve to the (intentionally unset) series
  // id instead of the clicked slice — see `getOption.js`.
  useEffect(() => {
    const chart = chartRef.current;
    if (onStatusPageMode || isPreview || !chart || chart.isDisposed()) {
      return undefined;
    }

    const handleClick = (params) => {
      if (params.componentType === 'series') {
        onChartClick(params);
      }
    };

    chart.on('click', handleClick);

    return () => {
      if (chart.isDisposed()) {
        return;
      }
      chart.off('click', handleClick);
    };
  }, [isPreview, onChartClick, onStatusPageMode]);

  const configData = useMemo(
    () => ({
      getOption,
      formatMessage,
      contentFields: widget.contentParameters.contentFields,
      configParams,
      chartText,
      small: isSmallView,
      uncheckedLegendItems,
    }),
    [formatMessage, widget, configParams, chartText, isSmallView, uncheckedLegendItems],
  );

  const legendConfig = useMemo(
    () => ({
      showLegend: !onStatusPageMode,
      onChangeLegend,
      uncheckedLegendItems,
    }),
    [onStatusPageMode, onChangeLegend, uncheckedLegendItems],
  );

  return (
    <div
      className={cx('donut-chart', {
        'status-page-mode': onStatusPageMode,
        'small-view': isSmallView,
      })}
    >
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        configData={configData}
        legendConfig={legendConfig}
        chartCreatedCallback={onChartCreated}
      />
    </div>
  );
};

DonutChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  uncheckedLegendItems: PropTypes.array,
  onChangeLegend: PropTypes.func,
  onStatusPageMode: PropTypes.bool,
  heightOffset: PropTypes.number,
  getLink: PropTypes.func,
  configParams: PropTypes.object,
  chartText: PropTypes.string,
};
