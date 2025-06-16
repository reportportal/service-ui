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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { UNIQUE_ERRORS_PAGE_EVENTS } from 'components/main/analytics/events';
import { InfoPanel } from 'pages/inside/common/infoPanel';
import { UNIQUE_ERRORS_VIEW } from 'controllers/testItem';
import { SelectedItems } from 'pages/inside/common/selectedItems';
import { UniqueErrorsActionPanel } from './actionPanel';
import styles from './uniqueErrorsToolbar.scss';

const cx = classNames.bind(styles);

export function UniqueErrorsToolbar({
  parentItem,
  selectedItems,
  errors,
  onUnselect,
  onUnselectAll,
  onDelete,
  onPostIssue,
  onLinkIssue,
  onUnlinkIssue,
  unselectAndFetchItems,
  onEditItems,
  onEditDefects,
}) {
  return (
    <>
      <div className={cx({ 'sticky-toolbar': selectedItems.length })}>
        {!!selectedItems.length && (
          <SelectedItems
            selectedItems={selectedItems}
            errors={errors}
            onUnselect={onUnselect}
            onClose={onUnselectAll}
          />
        )}
        <UniqueErrorsActionPanel
          hasErrors={selectedItems.some((item) => !!errors[item.id])}
          hasValidItems={selectedItems.length > Object.keys(errors).length}
          showBreadcrumbs={selectedItems.length === 0}
          selectedItems={selectedItems}
          onPostIssue={onPostIssue}
          onLinkIssue={onLinkIssue}
          onUnlinkIssue={onUnlinkIssue}
          onEditDefects={onEditDefects}
          onEditItems={onEditItems}
          onDelete={onDelete}
          parentItem={parentItem}
          unselectAndFetchItems={unselectAndFetchItems}
        />
      </div>
      {parentItem && (
        <InfoPanel
          withoutStatistics
          viewMode={UNIQUE_ERRORS_VIEW}
          data={parentItem}
          events={UNIQUE_ERRORS_PAGE_EVENTS}
        />
      )}
    </>
  );
}
UniqueErrorsToolbar.propTypes = {
  parentItem: PropTypes.object,
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  errors: PropTypes.object,
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
  onDelete: PropTypes.func,
  onPostIssue: PropTypes.func,
  onLinkIssue: PropTypes.func,
  onUnlinkIssue: PropTypes.func,
  unselectAndFetchItems: PropTypes.func,
  onEditItems: PropTypes.func,
  onEditDefects: PropTypes.func,
};
UniqueErrorsToolbar.defaultProps = {
  parentItem: null,
  selectedItems: [],
  errors: {},
  onUnselect: () => {},
  onUnselectAll: () => {},
  onDelete: () => {},
  onPostIssue: () => {},
  onLinkIssue: () => {},
  onUnlinkIssue: () => {},
  unselectAndFetchItems: () => {},
  onEditItems: () => {},
  onEditDefects: () => {},
};
