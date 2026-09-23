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
import { ALL } from 'common/constants/reservedFilterIds';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { defectTypesSelector } from 'controllers/project';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  getDefaultTestItemLinkParams,
  getDefectTypeLocators,
  getItemNameConfig,
  getChartDefaultProps,
} from 'components/widgets/common/utils';
import { EChart } from 'components/widgets/common/echarts';
import { getOption } from './config/getOption';
import styles from './launchesComparisonChart.scss';

const cx = classNames.bind(styles);

export const LaunchesComparisonChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  heightOffset,
  uncheckedLegendItems = [],
  onChangeLegend = () => {},
  clickable = true,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const defectTypes = useSelector(defectTypesSelector);
  const getDefectLink = useSelector(defectLinkSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);

  const onChartClick = useCallback(
    (data) => {
      const { organizationSlug, projectSlug } = slugs;
      const nameConfig = getItemNameConfig(data.id);
      const id = widget.content.result[data.index].id;
      const defaultParams = getDefaultTestItemLinkParams(projectSlug, ALL, id, organizationSlug);
      const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);

      const link = defectLocators
        ? getDefectLink({ defects: defectLocators, itemId: id })
        : getStatisticsLink({ statuses: [nameConfig.defectType.toUpperCase()] });

      dispatch(Object.assign(link, defaultParams));
    },
    [defectTypes, dispatch, getDefectLink, getStatisticsLink, slugs, widget],
  );

  const configData = useMemo(
    () => ({
      getOption,
      formatMessage,
      defectTypes,
      contentFields: widget.contentParameters.contentFields,
      onChartClick: clickable ? onChartClick : undefined,
    }),
    [clickable, defectTypes, formatMessage, onChartClick, widget],
  );

  const legendConfig = useMemo(
    () => ({
      onChangeLegend,
      showLegend: clickable,
      uncheckedLegendItems,
      legendProps: {
        noTotal: true,
      },
    }),
    [clickable, onChangeLegend, uncheckedLegendItems],
  );

  return (
    <div className={cx('launches-comparison-chart')}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        legendConfig={legendConfig}
        configData={configData}
      />
    </div>
  );
};

LaunchesComparisonChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
  uncheckedLegendItems: PropTypes.array,
  onChangeLegend: PropTypes.func,
  clickable: PropTypes.bool,
};
