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
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
} from 'components/widgets/common/utils';
import { ALL } from 'common/constants/reservedFilterIds';
import { EChart } from 'components/widgets/common/echarts';
import { getOption } from './config/getOption';
import styles from './launchesDurationChart.scss';

const cx = classNames.bind(styles);

export const LaunchesDurationChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  heightOffset,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);

  const onChartClick = useCallback(
    (data) => {
      const { organizationSlug, projectSlug } = slugs;
      const link = getDefaultTestItemLinkParams(
        projectSlug,
        ALL,
        `${widget.content.result[data.index].id}`,
        organizationSlug,
      );

      dispatch(link);
    },
    [dispatch, slugs, widget],
  );

  const configData = useMemo(
    () => ({
      getOption,
      formatMessage,
      onChartClick,
    }),
    [formatMessage, onChartClick],
  );

  return (
    <div className={cx('launches-duration-chart')}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        className={cx('widget-wrapper')}
        configData={configData}
        legendConfig={{
          showLegend: false,
        }}
      />
    </div>
  );
};

LaunchesDurationChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
};
