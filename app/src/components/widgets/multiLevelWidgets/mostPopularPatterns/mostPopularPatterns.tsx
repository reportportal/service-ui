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

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import { Dropdown } from '@reportportal/ui-kit';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { getQueryNamespace, TEST_ITEMS_TYPE_LIST } from 'controllers/testItem';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { getDefaultTestItemLinkParams } from 'components/widgets/common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PatternGrid } from './patternGrid';
import { MostPopularPatternsWidget, PatternsGroup } from './types';
import styles from './mostPopularPatterns.scss';

const cx = classNames.bind(styles);

const menuPortalRoot =
  typeof document === 'undefined'
    ? undefined
    : document.getElementById('tooltip-root') || document.body;

interface UrlSlugs {
  organizationSlug: string;
  projectSlug: string;
}

interface MostPopularPatternsProps {
  widget: MostPopularPatternsWidget;
  clearQueryParams?: (onClear?: () => void) => void;
}

const getAttributes = (data: PatternsGroup[] = []) =>
  data
    .map(({ attributeValue }) => ({
      label: attributeValue,
      value: attributeValue,
    }))
    .reverse();

const getDefaultAttribute = (data: PatternsGroup[] = []) =>
  data.length ? getAttributes(data)[0].value : null;

const getNavigationMetaParams = (
  patternName: string,
  compositeAttribute: string,
  launchesLimit: number,
  isLatest: boolean,
) => ({
  meta: {
    query: createNamespacedQuery(
      {
        'filter.eq.hasStats': true,
        'filter.eq.hasChildren': false,
        'filter.any.patternName': patternName,
        'filter.has.compositeAttribute': compositeAttribute,
        isLatest,
        launchesLimit,
      },
      getQueryNamespace(0),
    ),
  },
});

export const MostPopularPatterns = ({
  widget,
  clearQueryParams = () => {},
}: MostPopularPatternsProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as Partial<UrlSlugs>;

  const {
    appliedFilters,
    content: { result },
    contentParameters,
  } = widget;
  const { itemsCount, widgetOptions } = contentParameters;
  const { attributeKey, latest: isLatest } = widgetOptions;

  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(() =>
    getDefaultAttribute(result),
  );
  const resultRef = useRef(result);
  const prevSettingsRef = useRef({ contentParameters, appliedFilters });

  resultRef.current = result;

  useEffect(() => {
    const prevSettings = prevSettingsRef.current;

    prevSettingsRef.current = { contentParameters, appliedFilters };

    if (
      isEqual(prevSettings.contentParameters, contentParameters) &&
      isEqual(prevSettings.appliedFilters, appliedFilters)
    ) {
      return;
    }

    clearQueryParams(() => setSelectedAttribute(getDefaultAttribute(resultRef.current)));
  }, [contentParameters, appliedFilters, clearQueryParams]);

  const onChangeAttribute = (value: string | number | boolean | (string | number | boolean)[]) => {
    if (typeof value === 'string') {
      setSelectedAttribute(value);
    }
  };

  const onPatternClick = (patternName: string) => {
    const defaultNavigationParams = getDefaultTestItemLinkParams(
      projectSlug,
      appliedFilters[0].id,
      TEST_ITEMS_TYPE_LIST,
      organizationSlug,
    );
    const metaParams = getNavigationMetaParams(
      patternName,
      `${attributeKey}:${selectedAttribute}`,
      itemsCount,
      isLatest,
    );

    dispatch(Object.assign(defaultNavigationParams, metaParams));
  };

  if (!result?.length) return <NoDataAvailable />;

  return (
    <div className={cx('popular-patterns')}>
      <div className={cx('attribute-selector')}>
        <div className={cx('attribute-key')}>
          <span className={cx('description')}>{formatMessage(COMMON_LOCALE_KEYS.KEY)}:</span>
          <div title={`${attributeKey} : ${selectedAttribute}`} className={cx('attribute-label')}>
            {attributeKey}
          </div>
        </div>
        <div className={cx('attribute-input')}>
          <span className={cx('description')}>{formatMessage(COMMON_LOCALE_KEYS.VALUE)}:</span>
          <Dropdown
            className={cx('dropdown')}
            options={getAttributes(result)}
            value={selectedAttribute}
            onChange={onChangeAttribute}
            menuPortalRoot={menuPortalRoot}
          />
        </div>
      </div>
      <div className={cx('patterns-grid')}>
        <ScrollWrapper>
          <PatternGrid
            result={result}
            selectedAttribute={selectedAttribute}
            onPatternClick={onPatternClick}
          />
        </ScrollWrapper>
      </div>
    </div>
  );
};
