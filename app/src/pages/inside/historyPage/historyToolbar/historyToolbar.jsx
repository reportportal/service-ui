/*
 * Copyright 2019 EPAM Systems
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
import { InfoLine } from 'pages/inside/common/infoLine';
import { RefineFiltersPanel } from 'pages/inside/common/refineFiltersPanel';
import { ActionPanel } from './actionPanel';

export const HistoryToolbar = ({
  parentItem,
  onRefresh,
  onFilterAdd,
  onFilterRemove,
  onFilterValidate,
  onFilterChange,
  filterErrors,
  filterEntities,
}) => (
  <Fragment>
    <ActionPanel onRefresh={onRefresh} />
    {parentItem && <InfoLine data={parentItem} />}
    <RefineFiltersPanel
      onFilterAdd={onFilterAdd}
      onFilterRemove={onFilterRemove}
      onFilterValidate={onFilterValidate}
      onFilterChange={onFilterChange}
      filterErrors={filterErrors}
      filterEntities={filterEntities}
    />
  </Fragment>
);
HistoryToolbar.propTypes = {
  parentItem: PropTypes.object,
  filterErrors: PropTypes.object,
  filterEntities: PropTypes.array,
  isTestItemsList: PropTypes.bool,
  onRefresh: PropTypes.func,
  onFilterAdd: PropTypes.func,
  onFilterRemove: PropTypes.func,
  onFilterValidate: PropTypes.func,
  onFilterChange: PropTypes.func,
};
HistoryToolbar.defaultProps = {
  parentItem: null,
  filterErrors: {},
  filterEntities: [],
  isTestItemsList: false,
  onRefresh: () => {},
  onFilterAdd: () => {},
  onFilterRemove: () => {},
  onFilterValidate: () => {},
  onFilterChange: () => {},
};
