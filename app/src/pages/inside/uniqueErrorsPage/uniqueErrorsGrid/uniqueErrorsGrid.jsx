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

import React from 'react';
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
import { EmptyUniqueErrors } from '../emptyUniqueErrors';
import { ClusterItemsGridRow } from './clusterItemsGridRow';
import styles from './uniqueErrorsGrid.scss';

const cx = classNames.bind(styles);

export const UniqueErrorsGrid = ({ parentLaunch, data, loading, events, ...rest }) => {
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

  if (extensions.length) {
    extensions.forEach((extensionComponent) => {
      columns.push({
        title: {
          component: extensionComponent.component,
        },
      });
    });
  }

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
        <EmptyUniqueErrors parentLaunch={parentLaunch} events={events} />
      )}
    </>
  );
};
UniqueErrorsGrid.propTypes = {
  parentLaunch: PropTypes.object,
  data: PropTypes.array,
  loading: PropTypes.bool,
  events: PropTypes.object,
};
UniqueErrorsGrid.defaultProps = {
  parentLaunch: {},
  data: [],
  loading: false,
  events: {},
};
