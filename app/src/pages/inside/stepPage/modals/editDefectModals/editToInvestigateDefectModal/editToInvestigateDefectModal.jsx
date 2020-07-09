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
import { launchSelector } from 'controllers/testItem';
import { activeFilterSelector } from 'controllers/filter';
import { unlinkIssueAction, linkIssueAction, postIssueAction } from 'controllers/step';
import { hideModalAction } from 'controllers/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { getIssueTitle } from 'pages/inside/common/utils';
import { fetch, setStorageItem, getStorageItem, isEmptyObject } from 'common/utils';
import { URLS } from 'common/urls';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { MarkdownEditor } from 'components/main/markdown';
import { DefectTypeSelector } from 'pages/inside/common/defectTypeSelector';
import { MultiActionButton } from 'components/buttons/multiActionButton';
import { InputDropdown } from 'components/inputs/inputDropdown';
import {
  SEARCH_MODES,
  CHANGE_COMMENT_MODE,
  CURRENT_CHANGE_DEFECT_COMMENT_MODE,
} from './../constants';
import styles from './editToInvestigateDefectModal.scss';
import { ItemsList } from './itemsList';
import { messages } from './../messages';

const cx = classNames.bind(styles);

@withModal('editToInvestigateDefectModal')
@injectIntl
@connect(
  (state) => ({
    btsIntegrations: availableBtsIntegrationsSelector(state),
    activeProject: activeProjectSelector(state),
    currentLaunch: launchSelector(state),
    currentFilter: activeFilterSelector(state),
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
export class EditToInvestigateDefectModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    btsIntegrations: PropTypes.array.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
    showNotification: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
    unlinkIssueAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func.isRequired,
    postIssueAction: PropTypes.func.isRequired,
    isBtsPluginsExist: PropTypes.bool.isRequired,
    enabledBtsPlugins: PropTypes.array.isRequired,
    currentLaunch: PropTypes.object,
    currentFilter: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    currentLaunch: {},
    currentFilter: null,
  };

  constructor(props) {
    super(props);
    const {
      intl: { formatMessage },
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      data: { item },
    } = props;
    this.state = {
      searchMode: SEARCH_MODES.CURRENT_LAUNCH,
      selectedItems: [],
      testItems: [],
      changeCommentMode:
        getStorageItem(CURRENT_CHANGE_DEFECT_COMMENT_MODE) || CHANGE_COMMENT_MODE.NOT_CHANGE,
      ignoreAnalyzer: item.issue.ignoreAnalyzer,
      markdownValue: item.issue.comment || '',
      defectType: item.issue.issueType,
      loading: false,
    };
    const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);
    const issueTitle = getIssueTitle(
      formatMessage,
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      isPostIssueUnavailable,
    );

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
        disabled: !item.issue.externalSystemIssues || !item.issue.externalSystemIssues.length,
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
  }

  componentDidMount() {
    this.fetchSimilarDefects(this.state.searchMode);
  }

  onEditDefects = (nextAction, issueAction) => {
    const { editDefectsEvents } = this.props.data.eventsInfo;

    if (this.checkIfTheDataWasChanged()) {
      this.props.tracking.trackEvent(editDefectsEvents.EDIT_DESCRIPTION_EDIT_DEFECT_MODAL);
      this.saveDefects(this.prepareDataToSend());
    }
    !issueAction && this.props.tracking.trackEvent(editDefectsEvents.SAVE_BTN_EDIT_DEFECT_MODAL);
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

  getCurrentLaunch = () => {
    const {
      currentLaunch,
      data: {
        item: { pathNames: { launchPathName = {} } = {} },
      },
    } = this.props;

    return isEmptyObject(currentLaunch) ? launchPathName : currentLaunch;
  };

  prepareDataToSend = () => {
    const {
      selectedItems,
      markdownValue,
      defectType,
      ignoreAnalyzer,
      changeCommentMode,
    } = this.state;
    const { item } = this.props.data;
    const preparedItems = selectedItems.map((testItem) => {
      const issue = {
        ...testItem,
        id: testItem.itemId,
        testItemId: testItem.itemId,
        issue: {
          ...testItem.issue,
          issueType: defectType,
          ignoreAnalyzer,
          autoAnalyzed: false,
        },
      };

      if (changeCommentMode !== CHANGE_COMMENT_MODE.NOT_CHANGE) {
        if (issue.issue.comment && changeCommentMode === CHANGE_COMMENT_MODE.ADD_TO_EXISTING) {
          issue.issue.comment = `${issue.issue.comment || ''}\n${markdownValue}`;
        } else {
          issue.issue.comment = markdownValue;
        }
      }

      return issue;
    });

    preparedItems.push({
      ...item,
      testItemId: item.id,
      issue: {
        ...item.issue,
        issueType: defectType,
        ignoreAnalyzer,
        autoAnalyzed: false,
        comment: markdownValue,
      },
    });

    return preparedItems;
  };

  handleUnlinkIssue = () => {
    const { editDefectsEvents, unlinkIssueEvents } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(editDefectsEvents.unlinkIssueBtn);
    this.props.unlinkIssueAction(this.prepareDataToSend(), {
      fetchFunc: this.props.data.fetchFunc,
      eventsInfo: unlinkIssueEvents,
    });
  };

  handleLinkIssue = () => {
    const { editDefectsEvents, linkIssueEvents } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(editDefectsEvents.linkIssueBtn);
    return this.props.linkIssueAction(this.prepareDataToSend(), {
      fetchFunc: this.props.data.fetchFunc,
      eventsInfo: linkIssueEvents,
    });
  };

  handlePostIssue = () => {
    const { editDefectsEvents, postIssueEvents } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(editDefectsEvents.postIssueBtn);
    return this.props.postIssueAction(this.prepareDataToSend(), {
      fetchFunc: this.props.data.fetchFunc,
      eventsInfo: postIssueEvents,
    });
  };

  checkIfTheDataWasChanged = () => {
    const { item } = this.props.data;
    return (
      (!item.issue.comment && this.state.markdownValue) ||
      (item.issue.comment && this.state.markdownValue !== item.issue.comment) ||
      this.state.ignoreAnalyzer !== item.issue.ignoreAnalyzer ||
      this.state.defectType !== item.issue.issueType ||
      this.state.changeCommentMode !== CHANGE_COMMENT_MODE.NOT_CHANGE
    );
  };

  saveDefects = (issues) => {
    const {
      intl,
      activeProject,
      data: { fetchFunc },
    } = this.props;

    const url = URLS.testItems(activeProject);

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

  fetchSimilarDefects = (searchMode) => {
    const {
      activeProject,
      currentFilter,
      data: { item },
    } = this.props;

    const data = {
      searchMode,
    };

    if (searchMode === SEARCH_MODES.FILTER) {
      data.filterId = currentFilter.id;
    }

    const url = URLS.logSearch(activeProject, item.id);
    this.setState({ loading: true });
    fetch(url, {
      method: 'post',
      data,
    })
      .then((response) => {
        this.setState({
          testItems: response,
          loading: false,
        });
      })
      .catch(({ message }) => {
        this.setState({ loading: false });
        this.props.showNotification({
          message,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

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

  handleChangeSearchMode = (searchMode) => {
    const { changeSearchMode } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(changeSearchMode[searchMode]);
    this.setState(
      {
        searchMode,
        testItems: [],
        selectedItems: [],
      },
      () => this.fetchSimilarDefects(searchMode),
    );
  };

  handleSelectAllToggle = (checked) => {
    const { selectAllSimilarItems } = this.props.data.eventsInfo;

    this.props.tracking.trackEvent(selectAllSimilarItems);
    this.setState((state) => ({
      selectedItems: checked ? state.testItems.slice() : [],
    }));
  };

  handleToggleItemSelect = (item, selected) => {
    const { selectSpecificSimilarItem } = this.props.data.eventsInfo;

    if (selected) {
      this.props.tracking.trackEvent(selectSpecificSimilarItem);
      this.setState((state) => ({
        selectedItems: [...state.selectedItems, item],
      }));
    } else {
      this.setState((state) => ({
        selectedItems: state.selectedItems.filter(
          (selectedItem) => selectedItem.itemId !== item.itemId,
        ),
      }));
    }
  };

  handleChangeCommentMode = (value) => {
    this.setState({
      changeCommentMode: value,
    });
    setStorageItem(CURRENT_CHANGE_DEFECT_COMMENT_MODE, value);
  };

  renderFooter = () => (
    <div className={cx('footer')}>
      <div className={cx('change-mode-dropdown')}>
        {this.state.selectedItems.length > 0 && (
          <InputDropdown
            options={this.changeCommentModeOptions}
            value={this.state.changeCommentMode}
            onChange={this.handleChangeCommentMode}
          />
        )}
      </div>
      <div className={cx('items-count')}>
        {this.state.selectedItems.length > 0
          ? this.props.intl.formatMessage(messages.selectedCount, {
              count: this.state.selectedItems.length,
              total: this.state.testItems.length,
            })
          : this.state.testItems.length > 0 &&
            this.props.intl.formatMessage(messages.totalCount, {
              total: this.state.testItems.length,
            })}
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
      currentFilter,
      data: { eventsInfo },
    } = this.props;
    const customButton = {
      onClick: this.onEditDefects,
      buttonProps: {
        items: this.multiActionButtonItems,
        title: formatMessage(COMMON_LOCALE_KEYS.SAVE),
      },
      component: this.renderMultiActionButton,
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.editDefectsEvents.CANCEL_BTN_EDIT_DEFECT_MODAL,
    };
    return (
      <ModalLayout
        title={formatMessage(messages.title)}
        customButton={customButton}
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
          <div className={cx('input-switcher-wrapper')}>
            <InputSwitcher
              value={this.state.ignoreAnalyzer}
              onChange={this.handleIgnoreAnalyzerChange}
            >
              <span className={cx('ignore-aa-title')}>{formatMessage(messages.ignoreAaTitle)}</span>
            </InputSwitcher>
          </div>
          <div className={cx('markdown-container')}>
            <MarkdownEditor
              value={this.state.markdownValue}
              placeholder={formatMessage(messages.defectCommentPlaceholder)}
              onChange={this.handleMarkdownChange}
            />
            <div className={cx('markdown-disable-cover')} />
          </div>
          <ItemsList
            testItems={this.state.testItems}
            selectedItems={this.state.selectedItems}
            currentLaunch={this.getCurrentLaunch()}
            currentFilter={currentFilter}
            searchMode={this.state.searchMode}
            loading={this.state.loading}
            onSelectAllToggle={this.handleSelectAllToggle}
            onChangeSearchMode={this.handleChangeSearchMode}
            onToggleItemSelect={this.handleToggleItemSelect}
          />
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
