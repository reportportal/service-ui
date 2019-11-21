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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { userIdSelector } from 'controllers/user';
import { activeFilterSelector } from 'controllers/filter';
import { refreshHistoryAction } from 'controllers/itemsHistory';
import { parentItemSelector, isTestItemsListSelector } from 'controllers/testItem';
import { InfoLine, InfoLineListView } from 'pages/inside/common/infoLine';
import { HistoryToolbar } from './historyToolbar';
import { HistoryView } from './historyView';

@connect(
  (state) => ({
    parentItem: parentItemSelector(state),
    userId: userIdSelector(state),
    currentFilter: activeFilterSelector(state),
    isTestItemsList: isTestItemsListSelector(state),
  }),
  {
    refreshHistoryAction,
  },
)
export class HistoryPage extends Component {
  static propTypes = {
    refreshHistoryAction: PropTypes.func.isRequired,
    parentItem: PropTypes.object,
    currentFilter: PropTypes.object,
    userId: PropTypes.string,
    filterErrors: PropTypes.object,
    filterEntities: PropTypes.array,
    isTestItemsList: PropTypes.bool,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
  };

  static defaultProps = {
    parentItem: null,
    currentFilter: null,
    userId: '',
    filterErrors: {},
    filterEntities: [],
    isTestItemsList: false,
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
  };

  getInfoLine = () => {
    const { isTestItemsList, currentFilter, userId, parentItem } = this.props;

    if (isTestItemsList) {
      return !!currentFilter && <InfoLineListView data={currentFilter} currentUser={userId} />;
    }

    return !!parentItem && <InfoLine data={parentItem} />;
  };

  render() {
    const {
      refreshHistoryAction: refreshHistory,
      userId,
      currentFilter,
      parentItem,
      ...rest
    } = this.props;
    const infoLine = this.getInfoLine();

    return (
      <PageLayout>
        <PageSection>
          <HistoryToolbar onRefresh={refreshHistory} infoLine={infoLine} {...rest} />
          <HistoryView refreshHistory={refreshHistory} />
        </PageSection>
      </PageLayout>
    );
  }
}
