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
import { useTracking } from 'react-tracking';
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
import { uniqueErrorGridCellComponentSelector } from 'controllers/plugins/uiExtensions/selectors';
import { UNIQUE_ERRORS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ExtensionLoader } from 'components/extensionLoader';
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
    eventsInfo={{
      onOpenStackTraceEvent: () => UNIQUE_ERRORS_PAGE_EVENTS.CLICK_EXPANDED_ERROR_ARROW,
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
  const { id, matchedTests } = data;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const clusterItems = useSelector((state) => clusterItemsSelector(state, id));
  const extensions = useSelector(uniqueErrorGridCellComponentSelector);
  const { trackEvent } = useTracking();
  const {
    collapsed,
    loading,
    content,
    page: { number: currentPage, totalPages },
  } = clusterItems;
  const selectedItems = useSelector(selectedClusterItemsSelector);

  const onToggle = () => {
    if (collapsed) {
      trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.CLICK_CLUSTER_ITEM_ARROW);
    }

    dispatch(requestClusterItemsAction({ id }));
  };
  const loadMore = () => {
    dispatch(loadMoreClusterItemsAction({ id }));
  };
  const handleAllItemsSelection = () => {
    if (selectedItems.length !== content.length) {
      trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.CLICK_SELECT_ALL_ITEMS);
    }
    dispatch(toggleAllClusterItemsAction(content));
  };
  const handleOneItemSelection = (value) => {
    if (!selectedItems.includes(value)) {
      trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.CLICK_SELECT_ONE_ITEM);
    }
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
          {extensions.map((extension) => (
            <div className={cx('table-cell')} key={extension.name}>
              <ExtensionLoader extension={extension} data={data} />
            </div>
          ))}
          <div className={cx('table-cell')}>
            <span className={cx('matched-tests-col-text')}>{matchedTests}</span>
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className={cx('table-row-group')}>
          <div className={cx('table-row')}>
            <div className={cx('table-cell', 'nested-expand-col')} />
            <td colSpan="3">
              <div className={cx('nested-grid')}>
                <div className={cx('table-cell', 'table-cell-full-width')}>
                  <StepGrid
                    data={content}
                    modifyColumnsFunc={(columns) =>
                      modifyColumnsFunc(columns, modifyColumnsSettings)
                    }
                    selectedItems={selectedItems}
                    onAllItemsSelect={handleAllItemsSelection}
                    onItemSelect={handleOneItemSelection}
                    onItemsSelect={() => dispatch(selectClusterItemsAction)}
                    onUnlinkSingleTicket={onUnlinkSingleTicket}
                    onEditItem={onEditItem}
                    onEditDefect={onEditDefect}
                    onStatusUpdate={() => dispatch(reloadClustersAction())}
                    events={UNIQUE_ERRORS_PAGE_EVENTS}
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
            </td>
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
