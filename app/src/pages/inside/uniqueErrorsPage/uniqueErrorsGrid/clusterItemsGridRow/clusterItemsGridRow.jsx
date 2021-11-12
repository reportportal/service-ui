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
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { StepGrid } from 'pages/inside/stepPage/stepGrid';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import ArrowIcon from 'common/img/arrow-right-inline.svg';
import {
  clusterItemsSelector,
  loadMoreClusterItemsAction,
  requestClusterItemsAction,
  selectClusterItemsAction,
  selectedClusterItemsSelector,
  toggleAllClusterItemsAction,
  toggleClusterItemSelectionAction,
} from 'controllers/uniqueErrors/clusterItems';
import { ENTITY_METHOD_TYPE } from 'components/filterEntities/constants';
import { PROJECT_LOG_PAGE } from 'controllers/pages';
import { reloadClustersAction } from 'controllers/uniqueErrors';
import { modifyColumnsFunc } from './utils';
import styles from './clusterItemsGridRow.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loadLabel: {
    id: 'ClusterItemsGridRow.loadLabel',
    defaultMessage: 'Load more',
  },
});

const ClusterColumn = ({ cluster }) => (
  <StackTraceMessageBlock
    level={'error'}
    maxHeight={75}
    customProps={{
      rowWrapper: cx('cluster-row-wrapper'),
      row: cx('cluster-row'),
      accordionBlock: cx('cluster-accordion-block'),
    }}
  >
    <div>{cluster.message}</div>
  </StackTraceMessageBlock>
);
ClusterColumn.propTypes = {
  cluster: PropTypes.object,
};
ClusterColumn.defaultProps = {
  cluster: {},
};

export const ClusterItemsGridRow = ({ data, onEditItem, onUnlinkSingleTicket, onEditDefect }) => {
  const { id } = data;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const clusterItems = useSelector((state) => clusterItemsSelector(state, id));
  const {
    collapsed,
    loading,
    content,
    page: { number: currentPage, totalPages },
  } = clusterItems;
  const selectedItems = useSelector(selectedClusterItemsSelector);

  const onToggle = () => {
    dispatch(requestClusterItemsAction({ id }));
  };
  const loadMore = () => {
    dispatch(loadMoreClusterItemsAction({ id }));
  };
  const handleAllItemsSelection = () => {
    dispatch(toggleAllClusterItemsAction(content));
  };
  const handleOneItemSelection = (value) => {
    dispatch(toggleClusterItemSelectionAction(value));
  };
  const modifyColumnsSettings = {
    updateColumns: {
      name: {
        customProps: { className: cx('name-col'), ownLinkParams: { page: PROJECT_LOG_PAGE } },
      },
    },
    excludeColumns: ['predefinedFilterSwitcher', ENTITY_METHOD_TYPE],
  };

  return (
    <>
      <div className={cx('table-row-group')}>
        <div className={cx('table-row')}>
          <div className={cx('table-cell', 'expand-col')} onClick={onToggle}>
            <div className={cx('arrow-icon', { expanded: !collapsed })}>
              {collapsed && loading ? <SpinningPreloader /> : Parser(ArrowIcon)}
            </div>
          </div>
          <div className={cx('table-cell')}>
            <ClusterColumn cluster={data} />
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className={cx('table-row-group')}>
          <div className={cx('table-row')}>
            <div className={cx('table-cell', 'nested-expand-col')} />
            <div className={cx('table-cell')}>
              <StepGrid
                data={content}
                modifyColumnsFunc={(columns) => modifyColumnsFunc(columns, modifyColumnsSettings)}
                selectedItems={selectedItems}
                onAllItemsSelect={handleAllItemsSelection}
                onItemSelect={handleOneItemSelection}
                onItemsSelect={() => dispatch(selectClusterItemsAction)}
                onUnlinkSingleTicket={onUnlinkSingleTicket}
                onEditItem={onEditItem}
                onEditDefect={onEditDefect}
                onStatusUpdate={() => dispatch(reloadClustersAction())}
              />
              {totalPages > currentPage && (
                <div
                  className={cx('load-more-container', {
                    loading,
                  })}
                  onClick={loadMore}
                >
                  <div className={cx('load-more-label', { loading })}>
                    {formatMessage(messages.loadLabel)}
                  </div>
                  {loading && (
                    <div className={cx('loading-icon')}>
                      <SpinningPreloader />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
ClusterItemsGridRow.propTypes = {
  data: PropTypes.object,
  onEditItem: PropTypes.func,
  onUnlinkSingleTicket: PropTypes.func,
  onEditDefect: PropTypes.func,
};
ClusterItemsGridRow.defaultProps = {
  data: {},
  onEditItem: () => {},
  onUnlinkSingleTicket: () => {},
  onEditDefect: () => {},
};