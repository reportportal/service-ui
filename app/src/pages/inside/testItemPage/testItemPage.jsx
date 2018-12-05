import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { URLS } from 'common/urls';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { LEVEL_SUITE, LEVEL_TEST, LEVEL_STEP } from 'common/constants/launchLevels';
import { SUITES_PAGE_EVENTS } from 'components/main/analytics/events/suitesPageEvents';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
import {
  levelSelector,
  pageLoadingSelector,
  breadcrumbsSelector,
  restorePathAction,
  deleteItemsAction,
  launchSelector,
  fetchTestItemsAction,
  namespaceSelector,
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
    defaultMessage: "Are you sure to delete item <b>'{name}'</b>? It will no longer exist.",
  },
  deleteModalMultipleContent: {
    id: 'TestItemsPage.deleteModalMultipleContent',
    defaultMessage: 'Are you sure to delete items? They will no longer exist.',
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
  }),
  {
    restorePath: restorePathAction,
    deleteItemsAction,
    showNotification,
    showScreenLockAction,
    hideScreenLockAction,
    fetchTestItemsAction,
    showModalAction,
  },
)
@injectIntl
@track()
export class TestItemPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    parentLaunch: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    deleteItemsAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    fetchTestItemsAction: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
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
    level: null,
    loading: false,
    breadcrumbs: [],
    restorePath: () => {},
  };

  onEditItem = (launch) => {
    this.props.showModalAction({
      id: 'editItemModal',
      data: {
        item: launch,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.props.fetchTestItemsAction,
      },
    });
  };

  confirmDeleteItems = (items, selectedItems) => {
    const ids = items.map((item) => item.id).join(',');
    this.props.showScreenLockAction();
    return fetch(URLS.testItems(this.props.activeProject, ids), {
      method: 'delete',
    })
      .then(() => {
        this.props.fetchTestItemsAction();
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            selectedItems.length === 1
              ? this.props.intl.formatMessage(messages.success)
              : this.props.intl.formatMessage(messages.successMultiple),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            selectedItems.length === 1
              ? this.props.intl.formatMessage(messages.error)
              : this.props.intl.formatMessage(messages.errorMultiple),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  deleteItems = (selectedItems) => {
    const { intl, userId, tracking, level } = this.props;
    tracking.trackEvent(
      LEVEL_STEP === level ? STEP_PAGE_EVENTS.DELETE_ACTION : SUITES_PAGE_EVENTS.DELETE_BTN,
    );

    this.props.deleteItemsAction(selectedItems, {
      onConfirm: (items) => this.confirmDeleteItems(items, selectedItems),
      header:
        selectedItems.length === 1
          ? intl.formatMessage(messages.deleteModalHeader)
          : intl.formatMessage(messages.deleteModalMultipleHeader),
      mainContent:
        selectedItems.length === 1
          ? intl.formatMessage(messages.deleteModalContent, { name: selectedItems[0].name })
          : intl.formatMessage(messages.deleteModalMultipleContent),
      userId,
      currentLaunch: this.props.parentLaunch,
      warning:
        selectedItems.length === 1
          ? intl.formatMessage(messages.warning)
          : intl.formatMessage(messages.warningMultiple),
      eventsInfo: {
        closeIcon: LEVEL_STEP === level ? STEP_PAGE_EVENTS.CLOSE_ICON_DELETE_ITEM_MODAL : {},
        cancelBtn: LEVEL_STEP === level ? STEP_PAGE_EVENTS.CANCEL_BTN_DELETE_ITEM_MODAL : {},
        deleteBtn: LEVEL_STEP === level ? STEP_PAGE_EVENTS.DELETE_BTN_DELETE_ITEM_MODAL : {},
      },
    });
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
    return (
      <PageLayout>
        <PageSection>
          <div className={cx('breadcrumbs-container')}>
            {!loading && <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />}
          </div>
          {!loading && <NotFound />}
          {loading && <SpinningPreloader />}
        </PageSection>
      </PageLayout>
    );
  }
}
