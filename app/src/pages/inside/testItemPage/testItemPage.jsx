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
import { showNotification } from 'controllers/notification';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { LEVEL_SUITE, LEVEL_TEST, LEVEL_STEP } from 'common/constants/launchLevels';
import { SUITES_PAGE_EVENTS } from 'components/main/analytics/events/suitesPageEvents';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
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
  warning: {
    id: 'TestItemsPage.warning',
    defaultMessage:
      'You are going to delete not your own item. This may affect other users information on the project.',
  },
  warningMultiple: {
    id: 'TestItemsPage.warningMultiple',
    defaultMessage:
      'You are going to delete not your own items. This may affect other users information on the project.',
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

export const getDeleteItemsActionParameters = (items, formatMessage, rest = {}) => ({
  header:
    items.length === 1
      ? formatMessage(messages.deleteModalHeader)
      : formatMessage(messages.deleteModalMultipleHeader),
  mainContent:
    items.length === 1
      ? formatMessage(messages.deleteModalContent, { name: items[0].name })
      : formatMessage(messages.deleteModalMultipleContent),
  warning:
    items.length === 1 ? formatMessage(messages.warning) : formatMessage(messages.warningMultiple),
  ...rest,
});

const STEPS_DELETE_ITEMS_MODAL_EVENTS = {
  closeIcon: STEP_PAGE_EVENTS.DELETE_ITEM_MODAL_EVENTS.CLOSE_ICON_DELETE_ITEM_MODAL,
  cancelBtn: STEP_PAGE_EVENTS.DELETE_ITEM_MODAL_EVENTS.CANCEL_BTN_DELETE_ITEM_MODAL,
  deleteBtn: STEP_PAGE_EVENTS.DELETE_ITEM_MODAL_EVENTS.DELETE_BTN_DELETE_ITEM_MODAL,
};

const SUITES_DELETE_ITEMS_MODAL_EVENTS = {
  closeIcon: SUITES_PAGE_EVENTS.DELETE_ITEM_MODAL_EVENTS.CLOSE_ICON_DELETE_ITEM_MODAL,
  cancelBtn: SUITES_PAGE_EVENTS.DELETE_ITEM_MODAL_EVENTS.CANCEL_BTN_DELETE_ITEM_MODAL,
  deleteBtn: SUITES_PAGE_EVENTS.DELETE_ITEM_MODAL_EVENTS.DELETE_BTN_DELETE_ITEM_MODAL,
};

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
    userId: userIdSelector(state),
    activeProject: activeProjectSelector(state),
    namespace: namespaceSelector(state),
  }),
  (dispatch) => ({
    bulkDeleteTestItemsAction: (namespace) => (selectedItems, modalConfig) =>
      dispatch(createBulkDeleteTestItemsAction(namespace)(selectedItems, modalConfig)),
    unselectAllItemsAction: (namespace) => () => dispatch(unselectAllItemsAction(namespace)()),
    ...bindActionCreators(
      {
        restorePath: restorePathAction,
        deleteTestItemsAction,
        showNotification,
        showScreenLockAction,
        hideScreenLockAction,
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
    activeProject: PropTypes.string.isRequired,
    namespace: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    deleteTestItemsAction: PropTypes.func.isRequired,
    bulkDeleteTestItemsAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
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
    const { level } = this.props;
    const events = LEVEL_STEP === level ? STEP_PAGE_EVENTS : SUITES_PAGE_EVENTS;

    this.props.showModalAction({
      id: 'editItemModal',
      data: {
        item,
        type: LAUNCH_ITEM_TYPES.item,
        parentLaunch: this.props.parentLaunch,
        fetchFunc: this.props.fetchTestItemsAction,
        eventsInfo: events.EDIT_ITEMS_MODAL_EVENTS,
      },
    });
  };

  onEditItems = (items) => {
    const { level, tracking } = this.props;
    const events = LEVEL_STEP === level ? STEP_PAGE_EVENTS : SUITES_PAGE_EVENTS;
    tracking.trackEvent(events.EDIT_ITEMS_ACTION);

    this.props.showModalAction({
      id: 'editItemsModal',
      data: {
        items,
        parentLaunch: this.props.parentLaunch,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.unselectAndFetchItems,
        eventsInfo: {
          cancelBtn: events.EDIT_ITEMS_MODAL_EVENTS.CANCEL_BTN_EDIT_ITEM_MODAL,
          closeIcon: events.EDIT_ITEMS_MODAL_EVENTS.CLOSE_ICON_EDIT_ITEM_MODAL,
          saveBtn: events.EDIT_ITEMS_MODAL_EVENTS.SAVE_BTN_EDIT_ITEM_MODAL,
          editDescription: events.EDIT_ITEMS_MODAL_EVENTS.BULK_EDIT_ITEMS_DESCRIPTION,
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
      userId,
      tracking,
      level,
    } = this.props;
    tracking.trackEvent(
      LEVEL_STEP === level ? STEP_PAGE_EVENTS.DELETE_ACTION : SUITES_PAGE_EVENTS.DELETE_BTN,
    );

    const parameters = getDeleteItemsActionParameters(selectedItems, formatMessage, {
      onConfirm: (items) =>
        this.props.deleteTestItemsAction({
          items,
          callback: this.props.fetchTestItemsAction,
        }),
      userId,
      eventsInfo:
        LEVEL_STEP === level ? STEPS_DELETE_ITEMS_MODAL_EVENTS : SUITES_DELETE_ITEMS_MODAL_EVENTS,
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
