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

import React, { Component } from 'react';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { connect } from 'react-redux';
import { launchSelector, namespaceSelector, parentItemSelector } from 'controllers/testItem';
import {
  clustersSelector,
  loadingSelector,
  pageLoadingSelector,
  uniqueErrorsPaginationSelector,
} from 'controllers/uniqueErrors';
import PropTypes from 'prop-types';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { DEFAULT_PAGINATION, PAGE_KEY, SIZE_KEY, withPagination } from 'controllers/pagination';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { UniqueErrorsView } from './uniqueErrorsView';
import { UniqueErrorsToolbar } from './uniqueErrorsToolbar';

@connect((state) => ({
  pageLoading: pageLoadingSelector(state),
  loading: loadingSelector(state),
  parentLaunch: launchSelector(state),
  parentItem: parentItemSelector(state),
  clusters: clustersSelector(state),
}))
@withPagination({
  paginationSelector: uniqueErrorsPaginationSelector,
  namespaceSelector,
})
export class UniqueErrorsPage extends Component {
  static propTypes = {
    pageLoading: PropTypes.bool,
    loading: PropTypes.bool,
    parentLaunch: PropTypes.object,
    clusters: PropTypes.array,
    parentItem: PropTypes.object,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
  };
  static defaultProps = {
    pageLoading: false,
    loading: false,
    parentLaunch: {},
    clusters: [],
    parentItem: {},
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    onChangePage: () => {},
    onChangePageSize: () => {},
  };

  render() {
    const {
      parentLaunch,
      clusters,
      parentItem,
      pageLoading,
      loading,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
    } = this.props;

    return (
      <PageLayout>
        <PageSection>
          {pageLoading ? (
            <SpinningPreloader />
          ) : (
            <>
              <UniqueErrorsToolbar parentItem={parentItem} />
              <UniqueErrorsView parentLaunch={parentLaunch} clusters={clusters} loading={loading} />
            </>
          )}
          {!!pageCount && !loading && (
            <PaginationToolbar
              activePage={activePage}
              itemCount={itemCount}
              pageCount={pageCount}
              pageSize={pageSize}
              onChangePage={onChangePage}
              onChangePageSize={onChangePageSize}
            />
          )}
        </PageSection>
      </PageLayout>
    );
  }
}
