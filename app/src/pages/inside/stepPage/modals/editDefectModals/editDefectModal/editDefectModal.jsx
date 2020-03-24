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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import {
  availableBtsIntegrationsSelector,
  isPostIssueActionAvailable,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
} from 'controllers/plugins';
import { unlinkIssueAction, linkIssueAction, postIssueAction } from 'controllers/step';
import { hideModalAction } from 'controllers/modal';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch, setStorageItem, getStorageItem } from 'common/utils';
import { getIssueTitle } from 'pages/inside/common/utils';
import { URLS } from 'common/urls';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { MarkdownEditor } from 'components/main/markdown';
import { DefectTypeSelector } from 'pages/inside/common/defectTypeSelector';
import { MultiActionButton } from 'components/buttons/multiActionButton';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { CHANGE_COMMENT_MODE, CURRENT_CHANGE_DEFECT_COMMENT_MODE } from './../constants';
import { messages } from './../messages';
import styles from './editDefectModal.scss';

const cx = classNames.bind(styles);

@withModal('editDefectModal')
@injectIntl
@connect(
  (state) => ({
    btsIntegrations: availableBtsIntegrationsSelector(state),
    url: URLS.testItems(activeProjectSelector(state)),
    isBtsPluginsExist: isBtsPluginsExistSelector(state),
    enabledBtsPlugins: enabledBtsPluginsSelector(state),
  }),
  {
    showNotification,
    hideModalAction,
    unlinkIssueAction,
    linkIssueAction,
    postIssueAction,
  },
)
@track()
export class EditDefectModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
    btsIntegrations: PropTypes.array.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
      debugMode: PropTypes.bool,
      eventsInfo: PropTypes.object,
    }).isRequired,
    showNotification: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
    unlinkIssueAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func.isRequired,
    postIssueAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    isBtsPluginsExist: PropTypes.bool.isRequired,
    enabledBtsPlugins: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    const {
      intl: { formatMessage },
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      data: { items },
    } = props;
    const initialState = {};
    const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);
    const issueTitle = getIssueTitle(
      formatMessage,
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      isPostIssueUnavailable,
    );

    if (this.isBulkEditOperation()) {
      initialState.changeCommentMode =
        getStorageItem(CURRENT_CHANGE_DEFECT_COMMENT_MODE) || CHANGE_COMMENT_MODE.NOT_CHANGE;
      initialState.markdownValue = '';
      initialState.defectType = '';
    } else {
      initialState.ignoreAnalyzer = items[0].issue.ignoreAnalyzer;
      initialState.markdownValue = items[0].issue.comment || '';
      initialState.defectType = items[0].issue.issueType;
    }

    this.multiActionButtonItems = [
      {
        label: formatMessage(messages.saveAndPostIssueMessage),
        value: 'Post',
        title: isPostIssueUnavailable ? issueTitle : '',
        onClick: () => this.onEditDefects(this.handlePostIssue, true),
        disabled: isPostIssueUnavailable,
      },
      {
        label: formatMessage(messages.saveAndLinkIssueMessage),
        value: 'Link',
        title: btsIntegrations.length ? '' : issueTitle,
        onClick: () => this.onEditDefects(this.handleLinkIssue, true),
        disabled: !btsIntegrations.length,
      },
      {
        label: formatMessage(messages.saveAndUnlinkIssueMessage),
        value: 'Unlink',
        onClick: () => this.onEditDefects(this.handleUnlinkIssue, true),
        disabled: this.isBulkEditOperation()
          ? false
          : !items[0].issue.externalSystemIssues || !items[0].issue.externalSystemIssues.length,
      },
    ];

    this.changeCommentModeOptions = [
      {
        value: CHANGE_COMMENT_MODE.NOT_CHANGE,
        label: formatMessage(messages.notChangeCommentTitle),
      },
      {
        value: CHANGE_COMMENT_MODE.REPLACE,
        label: formatMessage(messages.replaceCommentsTitle),
      },
      {
        value: CHANGE_COMMENT_MODE.ADD_TO_EXISTING,
        label: formatMessage(messages.addToExistingCommentTitle),
      },
    ];

    this.state = {
      ...initialState,
    };
  }

  onEditDefects = (nextAction, issueAction) => {
    if (this.checkIfTheDataWasChanged()) {
      this.props.tracking.trackEvent(STEP_PAGE_EVENTS.EDIT_DESCRIPTION_EDIT_DEFECT_MODAL);
      this.fetchEditDefects(this.prepareDataToSend());
    }
    !issueAction && this.props.tracking.trackEvent(STEP_PAGE_EVENTS.SAVE_BTN_EDIT_DEFECT_MODAL);
    issueAction && this.props.hideModalAction();
    nextAction();
  };

  getCloseConfirmationConfig = () => {
    if (!this.checkIfTheDataWasChanged()) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  getItemsToTheNextAction = () => {
    const { items } = this.props.data;
    const updatedItems = this.prepareDataToSend();

    return items.map((item, index) => ({ ...item, ...updatedItems[index] }));
  };

  prepareDataToSend = () => {
    const { items } = this.props.data;
    let issues = null;

    if (this.isBulkEditOperation()) {
      issues = items.map((item) => {
        const dataToSend = {
          testItemId: item.id,
          issue: {
            ...item.issue,
            autoAnalyzed: false,
          },
        };

        if (this.state.defectType) {
          dataToSend.issue.issueType = this.state.defectType;
        }

        switch (this.state.changeCommentMode) {
          case CHANGE_COMMENT_MODE.REPLACE:
            dataToSend.issue.comment = this.state.markdownValue;
            break;
          case CHANGE_COMMENT_MODE.ADD_TO_EXISTING:
            dataToSend.issue.comment = `${dataToSend.issue.comment || ''}\n${
              this.state.markdownValue
            }`;
            break;
          default:
        }
        return dataToSend;
      });
    } else {
      issues = [
        {
          testItemId: items[0].id,
          issue: {
            ...items[0].issue,
            comment: this.state.markdownValue,
            issueType: this.state.defectType,
            ignoreAnalyzer: this.state.ignoreAnalyzer,
            autoAnalyzed: false,
          },
        },
      ];
    }
    return issues;
  };

  handleUnlinkIssue = () => {
    const { editDefectsEvents, unlinkIssueEvents } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(editDefectsEvents.unlinkIssueBtn);
    this.props.unlinkIssueAction(this.getItemsToTheNextAction(), {
      fetchFunc: this.props.data.fetchFunc,
      eventsInfo: unlinkIssueEvents,
    });
  };

  handleLinkIssue = () => {
    const { editDefectsEvents, linkIssueEvents } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(editDefectsEvents.linkIssueBtn);
    return this.props.linkIssueAction(this.getItemsToTheNextAction(), {
      fetchFunc: this.props.data.fetchFunc,
      eventsInfo: linkIssueEvents,
    });
  };

  handlePostIssue = () => {
    const { editDefectsEvents, postIssueEvents } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(editDefectsEvents.postIssueBtn);
    this.props.postIssueAction(this.getItemsToTheNextAction(), {
      fetchFunc: this.props.data.fetchFunc,
      eventsInfo: postIssueEvents,
    });
  };

  checkIfTheDataWasChanged = () => {
    const { items } = this.props.data;
    let isDataChanged = false;

    if (this.isBulkEditOperation()) {
      isDataChanged = Boolean(
        this.state.defectType ||
          (this.state.changeCommentMode !== CHANGE_COMMENT_MODE.NOT_CHANGE &&
            this.state.markdownValue),
      );
    } else {
      isDataChanged =
        (!items[0].issue.comment && this.state.markdownValue) ||
        (items[0].issue.comment && this.state.markdownValue !== items[0].issue.comment) ||
        this.state.ignoreAnalyzer !== items[0].issue.ignoreAnalyzer ||
        this.state.defectType !== items[0].issue.issueType;
    }
    return isDataChanged;
  };

  fetchEditDefects = (issues) => {
    const {
      intl,
      url,
      data: { fetchFunc },
    } = this.props;

    fetch(url, {
      method: 'put',
      data: {
        issues,
      },
    })
      .then(() => {
        fetchFunc(issues);
        this.props.showNotification({
          message: intl.formatMessage(messages.updateDefectsSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.updateDefectsFailed),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  isBulkEditOperation = () => this.props.data.items.length > 1;

  handleSelectDefectTypeChange = (newValue) => {
    this.setState({
      defectType: newValue,
    });
  };

  handleIgnoreAnalyzerChange = (newValue) => {
    const { editDefectsEvents } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(
      newValue
        ? editDefectsEvents.IGNORE_IN_AA_EDIT_DEFECT_MODAL
        : editDefectsEvents.INCLUDE_IN_AA_EDIT_DEFECT_MODAL,
    );
    this.setState({
      ignoreAnalyzer: newValue,
    });
  };

  handleMarkdownChange = (newValue) => {
    this.setState({
      markdownValue: newValue.trim(),
    });
  };

  handleChangeCommentMode = (value) => {
    this.setState({
      changeCommentMode: value,
    });
    setStorageItem(CURRENT_CHANGE_DEFECT_COMMENT_MODE, value);
  };

  renderFooter = () =>
    this.isBulkEditOperation() && (
      <div className={cx('footer')}>
        <div className={cx('change-mode-dropdown')}>
          <InputDropdown
            options={this.changeCommentModeOptions}
            value={this.state.changeCommentMode}
            onChange={this.handleChangeCommentMode}
          />
        </div>
      </div>
    );

  renderMultiActionButton = ({ ...rest }) => {
    const { editDefectsEvents } = this.props.data.eventsInfo;

    return (
      <MultiActionButton
        {...rest}
        toggleMenuEventInfo={editDefectsEvents.SAVE_BTN_DROPDOWN_EDIT_DEFECT_MODAL}
      />
    );
  };

  render() {
    const {
      intl: { formatMessage },
      data: { debugMode, eventsInfo },
    } = this.props;
    const customButton = {
      onClick: this.onEditDefects,
      buttonProps: {
        items: this.multiActionButtonItems,
        title: formatMessage(COMMON_LOCALE_KEYS.SAVE),
      },
      component: this.renderMultiActionButton,
    };
    const okButton = {
      onClick: this.onEditDefects,
      text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.editDefectsEvents.CANCEL_BTN_EDIT_DEFECT_MODAL,
    };
    return (
      <ModalLayout
        title={formatMessage(messages.title)}
        customButton={debugMode ? null : customButton}
        okButton={debugMode ? okButton : null}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.editDefectsEvents.CLOSE_ICON_EDIT_DEFECT_MODAL}
        className={cx('modal-window')}
        renderFooterElements={this.renderFooter}
      >
        <div className={cx('edit-defect-content')}>
          <div className={cx('defect-type')}>
            <span className={cx('defect-type-title')}>
              {formatMessage(messages.defectTypeTitle)}
            </span>
            <div className={cx('defect-type-selector-wrapper')}>
              <DefectTypeSelector
                onChange={this.handleSelectDefectTypeChange}
                value={this.state.defectType}
                placeholder={formatMessage(messages.defectTypeSelectorPlaceholder)}
              />
            </div>
          </div>
          {!this.isBulkEditOperation() && (
            <div className={cx('input-switcher-wrapper')}>
              <InputSwitcher
                value={this.state.ignoreAnalyzer}
                onChange={this.handleIgnoreAnalyzerChange}
              >
                <span className={cx('ignore-aa-title')}>
                  {formatMessage(messages.ignoreAaTitle)}
                </span>
              </InputSwitcher>
            </div>
          )}
          <div
            className={cx('markdown-container', {
              disabled:
                this.isBulkEditOperation() &&
                this.state.changeCommentMode === CHANGE_COMMENT_MODE.NOT_CHANGE,
            })}
          >
            <MarkdownEditor
              value={this.state.markdownValue}
              placeholder={formatMessage(messages.defectCommentPlaceholder)}
              onChange={this.handleMarkdownChange}
            />
            <div className={cx('markdown-disable-cover')} />
          </div>
          <div className={cx('edit-defect-bottom-row')}>
            <div className={cx('hot-keys-wrapper')}>
              <span className={cx('hot-keys')}>
                <span className={cx('hot-key')}>Esc </span>
                {formatMessage(messages.hotKeyCancelCaption)}
              </span>
              <span className={cx('hot-keys')}>
                <span className={cx('hot-key')}>Ctrl + Enter </span>
                {formatMessage(messages.hotKeySubmitCaption)}
              </span>
            </div>
          </div>
        </div>
      </ModalLayout>
    );
  }
}
