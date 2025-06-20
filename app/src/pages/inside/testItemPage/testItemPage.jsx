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

import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl, defineMessages } from 'react-intl';
import DOMPurify from 'dompurify';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { LEVEL_SUITE, LEVEL_TEST, LEVEL_STEP } from 'common/constants/launchLevels';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { unselectAllItemsAction } from 'controllers/groupOperations';
import {
  levelSelector,
  pageLoadingSelector,
  breadcrumbsSelector,
  restorePathAction,
  deleteTestItemsAction,
  createBulkDeleteTestItemsAction,
  launchSelector,
  fetchTestItemsAction,
  namespaceSelector,
  LEVELS,
} from 'controllers/testItem';
import { showModalAction } from 'controllers/modal';
import { SuitesPage } from 'pages/inside/suitesPage';
import { TestsPage } from 'pages/inside/testsPage';
import { StepPage } from 'pages/inside/stepPage';
import {
  FilterEntitiesURLContainer,
  FilterEntitiesContainer,
} from 'components/filterEntities/containers';
import { pageEventsMap } from 'components/main/analytics';
import { NotFound } from './notFound';

import styles from './testItemPage.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  deleteModalHeader: {
    id: 'TestItemsPage.deleteModalHeader',
    defaultMessage: 'Delete item',
  },
  deleteModalMultipleHeader: {
    id: 'TestItemsPage.deleteModalMultipleHeader',
    defaultMessage: 'Delete items',
  },
  deleteModalContent: {
    id: 'TestItemsPage.deleteModalContent',
    defaultMessage:
      "Are you sure you want to delete item <b>''{name}''</b>? It will no longer exist.",
  },
  deleteModalMultipleContent: {
    id: 'TestItemsPage.deleteModalMultipleContent',
    defaultMessage: 'Are you sure you want to delete items? They will no longer exist.',
  },
  success: {
    id: 'TestItemsPage.success',
    defaultMessage: 'Item was deleted',
  },
  successMultiple: {
    id: 'TestItemsPage.successMultiple',
    defaultMessage: 'Items were deleted',
  },
  error: {
    id: 'TestItemsPage.error',
    defaultMessage: 'Error when deleting item',
  },
  errorMultiple: {
    id: 'TestItemsPage.errorMultiple',
    defaultMessage: 'Error when deleting items',
  },
});

export const getDeleteItemsActionParameters = (
  items,
  formatMessage,
  { parentLaunch, ...rest } = {},
) => ({
  header:
    items.length === 1
      ? formatMessage(messages.deleteModalHeader)
      : formatMessage(messages.deleteModalMultipleHeader),
  mainContent:
    items.length === 1
      ? formatMessage(messages.deleteModalContent, {
          b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
          name: items[0].name,
        })
      : formatMessage(messages.deleteModalMultipleContent),
  ...rest,
});

const testItemPages = {
  [LEVEL_SUITE]: SuitesPage,
  [LEVEL_TEST]: TestsPage,
  [LEVEL_STEP]: StepPage,
};

@connect(
  (state) => ({
    level: levelSelector(state),
    loading: pageLoadingSelector(state),
    breadcrumbs: breadcrumbsSelector(state),
    parentLaunch: launchSelector(state),
  }),
  (dispatch) => ({
    bulkDeleteTestItemsAction: (namespace) => (selectedItems, modalConfig) =>
      dispatch(createBulkDeleteTestItemsAction(namespace)(selectedItems, modalConfig)),
    unselectAllItemsAction: (namespace) => dispatch(unselectAllItemsAction(namespace)()),
    ...bindActionCreators(
      {
        restorePath: restorePathAction,
        deleteTestItemsAction,
        fetchTestItemsAction,
        showModalAction,
      },
      dispatch,
    ),
  }),
)
@injectIntl
@track()
export class TestItemPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    deleteTestItemsAction: PropTypes.func.isRequired,
    bulkDeleteTestItemsAction: PropTypes.func.isRequired,
    fetchTestItemsAction: PropTypes.func.isRequired,
    unselectAllItemsAction: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    parentLaunch: PropTypes.object,
    level: PropTypes.string,
    loading: PropTypes.bool,
    breadcrumbs: PropTypes.arrayOf(PropTypes.object),
    restorePath: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    parentLaunch: {},
    level: null,
    loading: false,
    breadcrumbs: [],
    restorePath: () => {},
  };

  onEditItem = (item) => {
    const { level, parentLaunch } = this.props;
    const events = pageEventsMap[level];

    this.props.showModalAction({
      id: 'editItemModal',
      data: {
        item,
        type: LAUNCH_ITEM_TYPES.item,
        parentLaunch,
        fetchFunc: this.props.fetchTestItemsAction,
        eventsInfo: events.EDIT_ITEMS_MODAL_EVENTS,
      },
    });
  };

  onEditItems = (items) => {
    const { level, parentLaunch, tracking } = this.props;
    const events = pageEventsMap[level];
    tracking.trackEvent(events.EDIT_ITEMS_ACTION);

    this.props.showModalAction({
      id: 'editItemsModal',
      data: {
        items,
        parentLaunch,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.unselectAndFetchItems,
        eventsInfo: {
          getSaveBtnEditItemsEvent: events.EDIT_ITEMS_MODAL_EVENTS.getSaveBtnEditItemsEvent,
        },
      },
    });
  };

  unselectAndFetchItems = () => {
    this.props.unselectAllItemsAction(LEVELS[this.props.level].namespace);
    this.props.fetchTestItemsAction();
  };

  deleteItems = (selectedItems) => {
    const {
      intl: { formatMessage },
      parentLaunch,
      tracking,
      level,
    } = this.props;
    const events = pageEventsMap[level];
    tracking.trackEvent(LEVEL_STEP === level ? STEP_PAGE_EVENTS.DELETE_ACTION : events.DELETE_BTN);

    const parameters = getDeleteItemsActionParameters(selectedItems, formatMessage, {
      onConfirm: (items) => {
        this.props.tracking.trackEvent(
          events.getClickOnDeleteBtnDeleteItemModalEvent(items.length),
        );
        this.props.deleteTestItemsAction({
          items,
          callback: this.unselectAndFetchItems,
        });
      },
      parentLaunch,
      eventsInfo: {},
    });

    this.props.bulkDeleteTestItemsAction(LEVELS[level].namespace)(selectedItems, parameters);
  };

  render() {
    const { level, loading, breadcrumbs, restorePath } = this.props;
    if (!loading && testItemPages[level]) {
      const PageComponent = testItemPages[level];
      return (
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
                <PageComponent
                  deleteItems={this.deleteItems}
                  onEditItem={this.onEditItem}
                  onEditItems={this.onEditItems}
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
    const isItemNotFound = breadcrumbs.length > 2 && breadcrumbs[breadcrumbs.length - 1].error;
    return (
      <PageLayout>
        <PageSection>
          <div className={cx('breadcrumbs-container')}>
            {!loading && <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />}
          </div>
          {!loading && <NotFound isItemNotFound={isItemNotFound} />}
          {loading && <SpinningPreloader />}
        </PageSection>
      </PageLayout>
    );
  }
}
