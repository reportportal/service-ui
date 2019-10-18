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
import { PageLayout, PageSection } from 'layouts/pageLayout';
import PropTypes from 'prop-types';
import { refreshHistory } from 'controllers/itemsHistory';
import { parentItemSelector } from 'controllers/testItem';
import { connect } from 'react-redux';
import { HistoryToolbar } from './historyToolbar';
import { HistoryView } from './historyView';

@connect(
  (state) => ({
    parentItem: parentItemSelector(state),
  }),
  {
    refreshHistory,
  },
)
export class HistoryPage extends Component {
  static propTypes = {
    refreshHistory: PropTypes.func.isRequired,
    parentItem: PropTypes.object,
  };

  static defaultProps = {
    parentItem: null,
  };

  render() {
    return (
      <PageLayout>
        <PageSection>
          <HistoryToolbar
            onRefresh={this.props.refreshHistory}
            parentItem={this.props.parentItem}
          />
          <HistoryView refreshHistory={this.props.refreshHistory} />
        </PageSection>
      </PageLayout>
    );
  }
}
