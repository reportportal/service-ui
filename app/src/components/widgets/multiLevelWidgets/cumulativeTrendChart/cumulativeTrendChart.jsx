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
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { NoDataAvailableMaterializedView } from 'components/widgets/multiLevelWidgets/common/noDataAvailableMaterializedView';
import { VirtualPopup } from 'components/main/virtualPopup';
import { EChart } from 'components/widgets/common/echarts';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  defectLinkSelector,
  statisticsLinkSelector,
  TEST_ITEMS_TYPE_LIST,
  PROVIDER_TYPE_WIDGET,
} from 'controllers/testItem';
import { defectTypesSelector } from 'controllers/project';
import { SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
import { PASSED, FAILED, SKIPPED, INTERRUPTED } from 'common/constants/testStatuses';
import { formatAttribute } from 'common/utils/attributeUtils';
import { BEFORE_AFTER_METHOD_TYPES_SEQUENCE } from 'common/constants/methodTypes';
import { STATE_READY, DEFECTS, TOTAL_KEY } from 'components/widgets/common/constants';
import SearchIcon from 'common/img/search-icon-inline.svg';
import FiltersIcon from 'common/img/filters-icon-inline.svg';
import { getOption } from './config/getOption';
import { EXECUTION_FIELDS, getColorForKey, getDefectFields } from './config/utils';
import { CumulativeChartLegend } from './legend/cumulativeChartLegend';
import { ActionsPopup } from './actionsPopup';
import {
  getDefectTypeLocators,
  getItemNameConfig,
  getDefaultTestItemLinkParams,
} from '../../common/utils';
import styles from './cumulativeTrendChart.scss';

const cx = classNames.bind(styles);

const LEGEND_HEIGHT = 45;
const PRINTED_LEGEND_HEIGHT = 80;

const getSelectedStatus = (statKey) => {
  if (!statKey) {
    return null;
  }
  const [, groupKey, statusKey] = statKey.split('$');

  if (groupKey !== 'executions') {
    return null;
  }

  switch (statusKey) {
    case 'failed':
      return FAILED;
    case 'passed':
      return PASSED;
    case 'skipped':
      return SKIPPED;
    case 'interrupted':
      return INTERRUPTED;
    default:
      return null;
  }
};

export const CumulativeTrendChart = ({
  widget,
  container,
  fetchWidget = () => {},
  clearQueryParams = () => {},
  onChangeLegend = () => {},
  uncheckedLegendItems = [],
  userSettings = {},
  isPrintMode = false,
  onChangeUserSettings = () => {},
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const defectTypes = useSelector(defectTypesSelector);
  const getDefectLink = useSelector(defectLinkSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);

  const chartRef = useRef(null);
  const clickPositionRef = useRef({ left: 0, top: 0 });
  const prevWidgetOptionsRef = useRef(widget.contentParameters.widgetOptions);

  const [activeAttribute, setActiveAttribute] = useState(null);
  const [activeAttributes, setActiveAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLegendControlsShown, setLegendControlsShown] = useState(
    container.offsetWidth >= SCREEN_XS_MAX,
  );
  const [popupState, setPopupState] = useState({
    isShown: false,
    selectedItem: null,
    selectedStatus: null,
    selectedStatKey: null,
    selectedDefectLocators: null,
  });

  const getLegendHeight = useCallback(
    () => (isPrintMode ? PRINTED_LEGEND_HEIGHT : LEGEND_HEIGHT),
    [isPrintMode],
  );

  const attributes = widget.contentParameters.widgetOptions.attributes;
  const contentFields = widget.contentParameters.contentFields;
  const content = widget.content.result;
  const widgetState = widget.contentParameters?.widgetOptions.state;
  const isChartDataAvailable = !!content?.length;

  const hideActionsPopup = useCallback(() => {
    setPopupState({
      isShown: false,
      selectedItem: null,
      selectedStatus: null,
      selectedStatKey: null,
      selectedDefectLocators: null,
    });
  }, []);

  const clearAttributes = useCallback(() => {
    setActiveAttribute(null);
    setActiveAttributes([]);
    hideActionsPopup();
    clearQueryParams();
  }, [clearQueryParams, hideActionsPopup]);

  useEffect(() => {
    const nextWidgetOptions = widget.contentParameters.widgetOptions;
    if (!isEqual(prevWidgetOptionsRef.current, nextWidgetOptions)) {
      clearAttributes();
    }
    prevWidgetOptionsRef.current = nextWidgetOptions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget.contentParameters.widgetOptions]);

  useEffect(() => {
    const resizeTarget = container;
    if (!resizeTarget || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const resizeObserver = new ResizeObserver(() => {
      setLegendControlsShown(resizeTarget.offsetWidth >= SCREEN_XS_MAX);
    });
    resizeObserver.observe(resizeTarget);
    return () => resizeObserver.disconnect();
  }, [container]);

  const onLegendClick = useCallback(
    (fieldName) => {
      onChangeLegend(fieldName);
    },
    [onChangeLegend],
  );

  const legendItems = userSettings.defectTypes ? getDefectFields(contentFields) : EXECUTION_FIELDS;
  const legendColors = useMemo(() => {
    const colors = {};
    legendItems.forEach((field) => {
      colors[field] = getColorForKey(field);
    });
    return colors;
  }, [legendItems]);

  const configData = useMemo(
    () => ({
      getOption,
      formatMessage,
      contentFields,
      attributes,
      activeAttribute,
      userSettings,
      uncheckedLegendItems,
    }),
    [formatMessage, contentFields, attributes, activeAttribute, userSettings, uncheckedLegendItems],
  );

  const updateActiveAttributes = useCallback(
    (selectedItem, actionSuccessCallback) => {
      const newAttribute = {
        key: attributes[activeAttributes.length],
        value: selectedItem.attributeValue,
      };
      const newActiveAttributes = [...activeAttributes, newAttribute];

      setActiveAttribute(newAttribute);
      setActiveAttributes(newActiveAttributes);
      hideActionsPopup();
      actionSuccessCallback(newActiveAttributes);
    },
    [activeAttributes, attributes, hideActionsPopup],
  );

  const navigateToTestListView = useCallback(
    (newActiveAttributes) => {
      const { selectedItem, selectedStatus, selectedDefectLocators } = popupState;
      const navigationParams = getDefaultTestItemLinkParams(
        slugs.projectSlug,
        widget.appliedFilters[0].id,
        TEST_ITEMS_TYPE_LIST,
        slugs.organizationSlug,
      );
      let link;

      if (userSettings.defectTypes) {
        const namesConfig = Object.keys(selectedItem.content.statistics)
          .map((item) => getItemNameConfig(item))
          .filter((item) => item.itemType === DEFECTS && item.locator !== TOTAL_KEY);
        const defectLocators = namesConfig
          .map((item) => getDefectTypeLocators(item, defectTypes))
          .filter(Boolean);
        link = getDefectLink({
          defects: selectedDefectLocators?.length ? selectedDefectLocators : defectLocators,
          itemId: TEST_ITEMS_TYPE_LIST,
          providerType: PROVIDER_TYPE_WIDGET,
          widgetId: widget.id,
          levelAttribute: newActiveAttributes.map(formatAttribute).join(','),
          launchesLimit: widget.contentParameters.itemsCount,
          filterTypes: BEFORE_AFTER_METHOD_TYPES_SEQUENCE,
          filterType: true,
        });
      } else {
        let statisticsStatuses;
        if (!selectedStatus) {
          statisticsStatuses = [PASSED, FAILED, SKIPPED, INTERRUPTED];
        } else if (selectedStatus === FAILED) {
          statisticsStatuses = [FAILED, INTERRUPTED];
        } else {
          statisticsStatuses = [selectedStatus];
        }
        link = getStatisticsLink({
          ...(selectedDefectLocators?.length && { defects: selectedDefectLocators }),
          statuses: statisticsStatuses,
          levelAttribute: newActiveAttributes.map(formatAttribute).join(','),
          launchesLimit: widget.contentParameters.itemsCount,
          providerType: PROVIDER_TYPE_WIDGET,
          widgetId: widget.id,
        });
      }

      dispatch(Object.assign(link, navigationParams));
    },
    [
      defectTypes,
      dispatch,
      getDefectLink,
      getStatisticsLink,
      popupState,
      slugs,
      userSettings,
      widget,
    ],
  );

  const fetchWidgetWithActiveAttributes = useCallback(
    (newActiveAttributes) => {
      setIsLoading(true);
      fetchWidget({ attributes: newActiveAttributes }).then(() => {
        setIsLoading(false);
      });
    },
    [fetchWidget],
  );

  const drillDown = useCallback(() => {
    updateActiveAttributes(popupState.selectedItem, fetchWidgetWithActiveAttributes);
  }, [fetchWidgetWithActiveAttributes, popupState.selectedItem, updateActiveAttributes]);

  const showFilter = useCallback(() => {
    updateActiveAttributes(popupState.selectedItem, navigateToTestListView);
  }, [navigateToTestListView, popupState.selectedItem, updateActiveAttributes]);

  const getPopupActionItems = useCallback(
    () => [
      {
        id: 'drillDown',
        icon: SearchIcon,
        title: 'Drill down',
        onClick: drillDown,
        disabled: attributes.length <= activeAttributes.length + 1,
      },
      {
        id: 'showFilter',
        icon: FiltersIcon,
        title: 'Show filter',
        onClick: showFilter,
      },
    ],
    [activeAttributes.length, attributes.length, drillDown, showFilter],
  );

  const onChartElementClick = useCallback(
    (params) => {
      const dataIndex = params.dataIndex ?? 0;
      const selectedStatKey = params.seriesId || null;
      const selectedItem = content[dataIndex];
      const selectedStatus = getSelectedStatus(selectedStatKey);
      const nameConfig = selectedStatKey ? getItemNameConfig(selectedStatKey) : {};
      const selectedDefectLocators =
        selectedStatKey && nameConfig.itemType === DEFECTS
          ? getDefectTypeLocators(nameConfig, defectTypes)
          : null;

      clickPositionRef.current = {
        left: params.event?.offsetX ?? 0,
        top: (params.event?.offsetY ?? 0) + getLegendHeight(),
      };

      setPopupState({
        isShown: true,
        selectedItem,
        selectedStatus,
        selectedStatKey,
        selectedDefectLocators,
      });
    },
    [content, defectTypes, getLegendHeight],
  );

  const onChartCreated = useCallback((node, chart) => {
    chartRef.current = chart;
  }, []);

  // Registered separately (not inside `onChartCreated`, which the EChart wrapper only
  // invokes once, on chart creation) so the click handlers never close over stale
  // `content` / `defectTypes` / `popupState` from that first render.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return undefined;
    }

    const handleSeriesClick = (params) => {
      if (params.componentType === 'series') {
        onChartElementClick(params);
      }
    };
    const handleBackgroundClick = (event) => {
      if (!event.target) {
        hideActionsPopup();
      }
    };

    chart.on('click', handleSeriesClick);
    chart.getZr().on('click', handleBackgroundClick);

    return () => {
      chart.off('click', handleSeriesClick);
      chart.getZr().off('click', handleBackgroundClick);
    };
  }, [onChartElementClick, hideActionsPopup]);

  return (
    <div className={cx('cumulative-trend-chart')}>
      <CumulativeChartLegend
        items={legendItems}
        colors={legendColors}
        attributes={attributes}
        activeAttribute={activeAttribute}
        activeAttributes={activeAttributes}
        clearAttributes={clearAttributes}
        onClick={onLegendClick}
        onChangeUserSettings={onChangeUserSettings}
        uncheckedLegendItems={uncheckedLegendItems}
        userSettings={userSettings}
        isChartDataAvailable={isChartDataAvailable}
        isPrintMode={isPrintMode}
        isLegendControlsShown={isLegendControlsShown}
      />
      {isChartDataAvailable && widgetState === STATE_READY && !isLoading ? (
        <EChart
          widget={widget}
          container={container}
          heightOffset={getLegendHeight()}
          configData={configData}
          chartCreatedCallback={onChartCreated}
        />
      ) : (
        <div className={cx('no-data-wrapper')}>
          <NoDataAvailableMaterializedView state={widgetState} isLoading={isLoading} />
        </div>
      )}
      {popupState.isShown && (
        <VirtualPopup
          boundariesElement={container}
          referenceConfig={{
            className: cx('popup-reference'),
            style: { left: clickPositionRef.current.left, top: clickPositionRef.current.top },
          }}
        >
          <ActionsPopup items={getPopupActionItems()} />
        </VirtualPopup>
      )}
    </div>
  );
};

CumulativeTrendChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  fetchWidget: PropTypes.func,
  clearQueryParams: PropTypes.func,
  onChangeLegend: PropTypes.func,
  uncheckedLegendItems: PropTypes.array,
  userSettings: PropTypes.object,
  isPrintMode: PropTypes.bool,
  onChangeUserSettings: PropTypes.func,
};
