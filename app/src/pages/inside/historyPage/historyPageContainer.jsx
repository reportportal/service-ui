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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FilterEntitiesURLContainer,
  FilterEntitiesContainer,
} from 'components/filterEntities/containers';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { namespaceSelector, levelSelector } from 'controllers/testItem';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { HistoryPage } from './historyPage';

@connect((state) => ({
  level: levelSelector(state),
}))
export class HistoryPageContainer extends Component {
  static propTypes = {
    level: PropTypes.string,
  };

  static defaultProps = {
    level: '',
  };

  render() {
    const { level } = this.props;

    return !level ? (
      <PageLayout>
        <PageSection>
          <SpinningPreloader />
        </PageSection>
      </PageLayout>
    ) : (
      <FilterEntitiesURLContainer
        namespaceSelector={namespaceSelector}
        render={({ entities, onChange }) => (
          <FilterEntitiesContainer
            entities={entities}
            onChange={onChange}
            level={level}
            render={({
              filterErrors,
              filterValues,
              onFilterChange,
              onFilterValidate,
              onFilterAdd,
              onFilterRemove,
              filterEntities,
            }) => (
              <HistoryPage
                filterErrors={filterErrors}
                filterValues={filterValues}
                onFilterChange={onFilterChange}
                onFilterValidate={onFilterValidate}
                onFilterAdd={onFilterAdd}
                onFilterRemove={onFilterRemove}
                filterEntities={filterEntities}
              />
            )}
          />
        )}
      />
    );
  }
}
