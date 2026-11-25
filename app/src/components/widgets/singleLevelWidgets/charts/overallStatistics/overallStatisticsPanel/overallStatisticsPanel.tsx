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

import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { defectTypesSelector, orderedDefectFieldsSelector } from 'controllers/project';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  defectLinkSelector,
  statisticsLinkSelector,
  TEST_ITEMS_TYPE_LIST,
} from 'controllers/testItem';
import {
  getDefaultTestItemLinkParams,
  getDefectTypeLocators,
  getItemNameConfig,
} from 'components/widgets/common/utils';
import { isSeparateInterrupted } from '../isSeparateInterrupted';
import { TotalStatistics } from './totalStatistics';
import { OverallDefects } from './overallDefects';
import styles from './overallStatisticsPanel.scss';

const cx = classNames.bind(styles);

export interface OverallStatisticsPanelWidget {
  content: {
    result: { values: Record<string, number> }[];
  };
  contentParameters: {
    itemsCount: number;
    contentFields: string[];
    widgetOptions: {
      latest?: boolean;
    };
  };
  appliedFilters: { id: number }[];
}

interface UrlSlugs {
  organizationSlug: string;
  projectSlug: string;
}

export interface OverallStatisticsPanelProps {
  widget: OverallStatisticsPanelWidget;
  isPreview?: boolean;
}

export const OverallStatisticsPanel = ({
  widget,
  isPreview = false,
}: OverallStatisticsPanelProps) => {
  const dispatch = useDispatch();
  const orderedContentFields = useSelector(orderedDefectFieldsSelector);
  const defectTypes = useSelector(defectTypesSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as Partial<UrlSlugs>;
  const getDefectLink = useSelector(defectLinkSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);

  const { itemsCount, widgetOptions } = widget.contentParameters;
  const { latest: isLatest } = widgetOptions;

  const navigateToLink = (link: Record<string, unknown>) => {
    const navigationParams = getDefaultTestItemLinkParams(
      projectSlug,
      widget.appliedFilters[0].id,
      TEST_ITEMS_TYPE_LIST,
      organizationSlug,
    );

    dispatch(Object.assign(link, navigationParams));
  };

  const onTotalStatisticsClick = (...statuses: string[]) => {
    navigateToLink(getStatisticsLink({ statuses, launchesLimit: itemsCount, isLatest }));
  };

  const onOverallDefectsClick = (defects: string[] | null) => {
    navigateToLink(
      getDefectLink({
        defects,
        itemId: TEST_ITEMS_TYPE_LIST,
        launchesLimit: itemsCount,
        isLatest,
      }),
    );
  };

  const onDefectClick = (defectField: string) => {
    onOverallDefectsClick(
      getDefectTypeLocators(
        getItemNameConfig(defectField) as { defectType: string; locator: string },
        defectTypes,
      ) as string[] | null,
    );
  };

  const getTotals = () => {
    const { values } = widget.content.result[0];
    const fields = widget.contentParameters.contentFields.filter((field) =>
      field.includes('executions'),
    );
    const newValues: Record<string, number> = {};

    fields.forEach((field) => {
      newValues[field] = values[field] || 0;
    });

    if (isSeparateInterrupted(widget)) {
      newValues.statistics$executions$interrupted = values.statistics$executions$interrupted ?? 0;
    }

    return newValues;
  };

  const { contentFields } = widget.contentParameters;

  return (
    <div className={cx('container', { preview: isPreview })}>
      <div className={cx('total')}>
        <TotalStatistics
          onChartClick={onTotalStatisticsClick}
          values={getTotals()}
          separateInterrupted={isSeparateInterrupted(widget)}
          isPreview={isPreview}
        />
      </div>

      {!isPreview && (
        <>
          <div className={cx('divider')} />
          <div className={cx('defects')}>
            <OverallDefects
              onChartClick={onDefectClick}
              values={widget.content.result[0].values}
              contentFields={contentFields}
              orderedContentFields={orderedContentFields}
              defectTypes={defectTypes}
            />
          </div>
        </>
      )}
    </div>
  );
};
