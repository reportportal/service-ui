/*
 * Copyright 2021 EPAM Systems
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

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Grid } from 'components/main/grid';
import { useSelector } from 'react-redux';
import { uniqueErrorGridHeaderCellComponentSelector } from 'controllers/plugins/uiExtensions/selectors';
import { NoItemMessage } from 'components/main/noItemMessage';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useIntl } from 'react-intl';
import { extractNamespacedQuery } from 'common/utils/routingUtils';
import { NAMESPACE } from 'controllers/uniqueErrors';
import { querySelector } from 'controllers/pages';
import { ExtensionLoader } from 'components/extensionLoader';
import { SORTING_DESC, withSortingURL } from 'controllers/sorting';
import { UNIQUE_ERRORS_PAGE_EVENTS } from 'components/main/analytics/events';
import { EmptyUniqueErrors } from '../emptyUniqueErrors';
import { ClusterItemsGridRow } from './clusterItemsGridRow';
import styles from './uniqueErrorsGrid.scss';

const cx = classNames.bind(styles);
const MATCHED_TESTS_COLUMN_ID = 'matchedTests';

export const UniqueErrorsGridWrapped = ({ parentLaunch, data, loading, ...rest }) => {
  const { formatMessage } = useIntl();
  const query = useSelector(querySelector);
  const hasNamespacedQuery = Object.keys(extractNamespacedQuery(query, NAMESPACE)).length;
  const extensions = useSelector(uniqueErrorGridHeaderCellComponentSelector);
  const columns = [
    {
      id: 'expand',
      title: {
        full: '',
      },
      customProps: {
        gridHeaderCellStyles: cx('expand-col'),
      },
    },
    {
      id: 'error',
      title: {
        full: 'ERROR LOG',
        short: 'ERROR LOG',
      },
      customProps: {
        gridHeaderCellStyles: cx('cluster-header'),
      },
    },
  ];

  const memoizedExtensionsColumns = useMemo(() => {
    if (!extensions.length) return [];

    return extensions.map((extension) => {
      const MemoizedComponent = (params) => (
        <div className={cx('extension-col')}>
          <ExtensionLoader extension={extension} {...params} />
        </div>
      );

      return {
        title: {
          component: MemoizedComponent,
        },
      };
    });
  }, [extensions]);

  columns.push(...memoizedExtensionsColumns, {
    id: MATCHED_TESTS_COLUMN_ID,
    title: {
      full: 'MATCHED TESTS',
    },
    activeSorting: true,
    sortable: true,
    customProps: {
      gridHeaderCellStyles: cx('matched-header'),
    },
    sortingEventInfo: UNIQUE_ERRORS_PAGE_EVENTS.CLICK_MATCHED_TESTS_HEADER_CELL,
  });

  return (
    <>
      {data.length > 0 || hasNamespacedQuery ? (
        <>
          <Grid
            columns={columns}
            data={data.map((item) => ({
              ...item,
              hasContent: true,
            }))}
            loading={loading}
            nestedGridRow={ClusterItemsGridRow}
            nestedView
            {...rest}
          />
          {!loading && !data.length && (
            <NoItemMessage message={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
          )}
        </>
      ) : (
        <EmptyUniqueErrors parentLaunch={parentLaunch} />
      )}
    </>
  );
};
UniqueErrorsGridWrapped.propTypes = {
  parentLaunch: PropTypes.object,
  data: PropTypes.array,
  loading: PropTypes.bool,
};
UniqueErrorsGridWrapped.defaultProps = {
  parentLaunch: {},
  data: [],
  loading: false,
};

export const UniqueErrorsGrid = withSortingURL({
  defaultFields: [MATCHED_TESTS_COLUMN_ID],
  defaultDirection: SORTING_DESC,
  namespace: NAMESPACE,
})(UniqueErrorsGridWrapped);
