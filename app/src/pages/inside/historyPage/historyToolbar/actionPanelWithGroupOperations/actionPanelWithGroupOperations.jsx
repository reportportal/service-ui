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

import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import {
  linkIssueHistoryAction,
  unlinkIssueHistoryAction,
  postIssueHistoryAction,
  editDefectsHistoryAction,
  deleteHistoryItemsAction,
  lastOperationSelector,
  proceedWithValidItemsAction,
  validationErrorsSelector,
} from 'controllers/itemsHistory';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { launchSelector, deleteTestItemsAction } from 'controllers/testItem';
import { isDefectGroupOperationAvailable } from 'controllers/step';
import { getDefectTypeSelector } from 'controllers/project';
import { HISTORY_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  availableBtsIntegrationsSelector,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
} from 'controllers/plugins';
import { SelectedItems } from 'pages/inside/common/selectedItems';
import { getDeleteItemsActionParameters } from 'pages/inside/testItemPage';
import { GhostButton } from 'components/buttons/ghostButton';
import { GhostMenuButton } from 'components/buttons/ghostMenuButton';
import { createStepActionDescriptors } from 'pages/inside/common/utils';
import { ActionPanel } from '../actionPanel';

@connect(
  (state) => ({
    parentLaunch: launchSelector(state),
    getDefectType: getDefectTypeSelector(state),
    btsIntegrations: availableBtsIntegrationsSelector(state),
    accountRole: userAccountRoleSelector(state),
    projectRole: activeProjectRoleSelector(state),
    isBtsPluginsExist: isBtsPluginsExistSelector(state),
    enabledBtsPlugins: enabledBtsPluginsSelector(state),
    validationErrors: validationErrorsSelector(state),
    lastOperation: lastOperationSelector(state),
  }),
  {
    proceedWithValidItems: proceedWithValidItemsAction,
    onLinkIssue: linkIssueHistoryAction,
    onUnlinkIssue: unlinkIssueHistoryAction,
    onPostIssue: postIssueHistoryAction,
    onEditDefects: editDefectsHistoryAction,
    deleteHistoryItems: deleteHistoryItemsAction,
    deleteTestItemsAction,
    showModalAction,
  },
)
@injectIntl
export class ActionPanelWithGroupOperations extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    accountRole: PropTypes.string.isRequired,
    projectRole: PropTypes.string.isRequired,
    parentLaunch: PropTypes.object,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    validationErrors: PropTypes.object,
    lastOperation: PropTypes.object,
    btsIntegrations: PropTypes.array,
    enabledBtsPlugins: PropTypes.array,
    isBtsPluginsExist: PropTypes.bool,
    debugMode: PropTypes.bool,
    getDefectType: PropTypes.func,
    onRefresh: PropTypes.func,
    onUnselect: PropTypes.func,
    onUnselectAll: PropTypes.func,
    proceedWithValidItems: PropTypes.func,
    onLinkIssue: PropTypes.func,
    onUnlinkIssue: PropTypes.func,
    onPostIssue: PropTypes.func,
    onEditDefects: PropTypes.func,
    deleteHistoryItems: PropTypes.func,
    showModalAction: PropTypes.func,
    deleteTestItemsAction: PropTypes.func,
  };

  static defaultProps = {
    parentLaunch: {},
    selectedItems: [],
    validationErrors: {},
    lastOperation: {},
    btsIntegrations: [],
    enabledBtsPlugins: [],
    isBtsPluginsExist: false,
    debugMode: false,
    getDefectType: () => {},
    onRefresh: () => {},
    onUnselect: () => {},
    onUnselectAll: () => {},
    proceedWithValidItems: () => {},
    onLinkIssue: () => {},
    onUnlinkIssue: () => {},
    onPostIssue: () => {},
    onEditDefects: () => {},
    deleteHistoryItems: () => {},
    showModalAction: () => {},
    deleteTestItemsAction: () => {},
  };

  onEditItems = () => {
    this.props.showModalAction({
      id: 'editItemsModal',
      data: {
        items: this.props.selectedItems,
        parentLaunch: this.props.parentLaunch,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.unselectAndRefreshItems,
        eventsInfo: {
          cancelBtn: HISTORY_PAGE_EVENTS.CANCEL_BTN_EDIT_ITEM_MODAL,
          closeIcon: HISTORY_PAGE_EVENTS.CLOSE_ICON_EDIT_ITEM_MODAL,
          saveBtn: HISTORY_PAGE_EVENTS.SAVE_BTN_EDIT_ITEM_MODAL,
          editDescription: HISTORY_PAGE_EVENTS.BULK_EDIT_ITEMS_DESCRIPTION,
        },
      },
    });
  };

  getActionDescriptors = () => {
    const {
      intl: { formatMessage },
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      accountRole,
      projectRole,
      debugMode,
    } = this.props;

    return createStepActionDescriptors({
      historyView: true,
      formatMessage,
      debugMode,
      onEditItems: this.onEditItems,
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      accountRole,
      projectRole,
      onDelete: this.handleDeleteItems,
      onEditDefects: this.handleEditDefects,
      onPostIssue: this.handlePostIssue,
      onLinkIssue: this.handleLinkIssue,
      onUnlinkIssue: this.handleUnlinkIssue,
    });
  };

  getActionButtons = () => {
    const {
      intl: { formatMessage },
      selectedItems,
    } = this.props;
    const actionDescriptors = this.getActionDescriptors();

    return [
      <GhostMenuButton
        title={formatMessage(COMMON_LOCALE_KEYS.ACTIONS)}
        items={actionDescriptors}
        disabled={!selectedItems.length}
      />,
    ];
  };

  getCustomBlock = (hasErrors) => {
    const { intl, selectedItems, validationErrors } = this.props;
    const hasValidItems = selectedItems.length > Object.keys(validationErrors).length;

    if (hasErrors) {
      return (
        <GhostButton disabled={!hasValidItems} onClick={this.proceedWithValidItems}>
          {intl.formatMessage(COMMON_LOCALE_KEYS.PROCEED_VALID_ITEMS)}
        </GhostButton>
      );
    }

    return null;
  };

  handleUnlinkIssue = () =>
    this.props.onUnlinkIssue(this.props.selectedItems, {
      fetchFunc: this.unselectAndRefreshItems,
    });

  handleLinkIssue = () =>
    this.props.onLinkIssue(this.props.selectedItems, {
      fetchFunc: this.unselectAndRefreshItems,
      eventsInfo: {},
    });

  handlePostIssue = () =>
    this.props.onPostIssue(this.props.selectedItems, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: {},
    });

  handleDeleteItems = () => {
    const {
      intl: { formatMessage },
      selectedItems,
      userId,
      deleteHistoryItems,
    } = this.props;

    const parameters = getDeleteItemsActionParameters(selectedItems, formatMessage, {
      onConfirm: (items) =>
        this.props.deleteTestItemsAction({
          items,
          callback: this.unselectAndRefreshItems,
        }),
      userId,
      eventsInfo: {}, // TODO: Add analytics events here
    });

    deleteHistoryItems(selectedItems, parameters);
  };

  handleEditDefects = (eventData) => {
    const { selectedItems, getDefectType, debugMode, onEditDefects } = this.props;
    const items = eventData && eventData.id ? [eventData] : selectedItems;
    const isDefectGroupOperation = isDefectGroupOperationAvailable({
      editedData: eventData,
      selectedItems,
      getDefectType,
      debugMode,
    });
    if (isDefectGroupOperation) {
      this.props.showModalAction({
        id: 'editToInvestigateDefectModal',
        data: {
          item: items[0],
          fetchFunc: this.unselectAndRefreshItems,
          eventsInfo: {},
        },
      });
    } else {
      onEditDefects(items, {
        fetchFunc: this.unselectAndRefreshItems,
        debugMode,
        eventsInfo: {},
      });
    }
  };

  proceedWithValidItems = () => {
    const {
      lastOperation: { operationName, operationArgs },
      selectedItems,
      proceedWithValidItems,
    } = this.props;

    proceedWithValidItems(operationName, selectedItems, operationArgs);
  };

  unselectAndRefreshItems = () => {
    this.props.onUnselectAll();
    this.props.onRefresh();
  };

  render() {
    const { selectedItems, validationErrors, onUnselect, onUnselectAll, onRefresh } = this.props;
    const hasErrors = selectedItems.some((item) => !!validationErrors[item.id]);

    return (
      <Fragment>
        {!!selectedItems.length && (
          <SelectedItems
            selectedItems={selectedItems}
            errors={validationErrors}
            onUnselect={onUnselect}
            onClose={onUnselectAll}
          />
        )}
        <ActionPanel
          onRefresh={onRefresh}
          buttons={this.getActionButtons()}
          customBlock={this.getCustomBlock(hasErrors)}
          hasErrors={hasErrors}
          showBreadcrumbs={selectedItems.length === 0}
        />
      </Fragment>
    );
  }
}
