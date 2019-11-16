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
import { refreshHistoryAction } from 'controllers/itemsHistory';
import { parentItemSelector } from 'controllers/testItem';
import { HistoryToolbar } from './historyToolbar';
import { HistoryView } from './historyView';

@connect(
  (state) => ({
    parentItem: parentItemSelector(state),
  }),
  {
    refreshHistoryAction,
  },
)
export class HistoryPage extends Component {
  static propTypes = {
    refreshHistoryAction: PropTypes.func.isRequired,
    parentItem: PropTypes.object,
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
    filterErrors: {},
    filterEntities: [],
    isTestItemsList: false,
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
  };

  render() {
    const { refreshHistoryAction: refreshHistory, ...rest } = this.props;

    return (
      <PageLayout>
        <PageSection>
          <HistoryToolbar onRefresh={refreshHistory} {...rest} />
          <HistoryView refreshHistory={refreshHistory} />
        </PageSection>
      </PageLayout>
    );
  }
}
