import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { availableBtsIntegrationsSelector, isPostIssueActionAvailable } from 'controllers/plugins';
import { fetchTestItemsAction, launchSelector } from 'controllers/testItem';
import { activeFilterSelector } from 'controllers/filter';
import { unlinkIssueAction, linkIssueAction, postIssueAction } from 'controllers/step';
import { hideModalAction } from 'controllers/modal';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch, setStorageItem, getStorageItem } from 'common/utils';
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
  }),
  {
    showNotification,
    hideModalAction,
    fetchTestItemsAction,
    unlinkIssueAction,
    linkIssueAction,
    postIssueAction,
  },
)
@track()
export class EditToInvestigateDefectModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activeProject: PropTypes.string.isRequired,
    btsIntegrations: PropTypes.array.isRequired,
    data: PropTypes.shape({
      item: PropTypes.array,
      fetchFunc: PropTypes.func,
    }).isRequired,
    showNotification: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
    fetchTestItemsAction: PropTypes.func.isRequired,
    unlinkIssueAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func.isRequired,
    postIssueAction: PropTypes.func.isRequired,
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
      intl,
      btsIntegrations,
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

    this.multiActionButtonItems = [
      {
        label: intl.formatMessage(messages.saveAndPostIssueMessage),
        value: 'Post',
        onClick: () => this.onEditDefects(this.handlePostIssue, true),
        disabled: !isPostIssueActionAvailable(btsIntegrations),
      },
      {
        label: intl.formatMessage(messages.saveAndLinkIssueMessage),
        value: 'Link',
        onClick: () => this.onEditDefects(this.handleLinkIssue, true),
        disabled: !btsIntegrations.length,
      },
      {
        label: intl.formatMessage(messages.saveAndUnlinkIssueMessage),
        value: 'Unlink',
        onClick: () => this.onEditDefects(this.handleUnlinkIssue, true),
        disabled: !item.issue.externalSystemIssues || !item.issue.externalSystemIssues.length,
      },
    ];

    this.changeCommentModeOptions = [
      {
        value: CHANGE_COMMENT_MODE.NOT_CHANGE,
        label: intl.formatMessage(messages.notChangeCommentTitle),
      },
      {
        value: CHANGE_COMMENT_MODE.REPLACE,
        label: intl.formatMessage(messages.replaceCommentsTitle),
      },
      {
        value: CHANGE_COMMENT_MODE.ADD_TO_EXISTING,
        label: intl.formatMessage(messages.addToExistingCommentTitle),
      },
    ];
  }

  componentDidMount() {
    this.fetchSimilarDefects(this.state.searchMode);
  }

  onEditDefects = (nextAction, issueAction) => {
    if (this.checkIfTheDataWasChanged()) {
      this.props.tracking.trackEvent(STEP_PAGE_EVENTS.EDIT_DESCRIPTION_EDIT_DEFECT_MODAL);
      this.saveDefects(this.prepareDataToSend());
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

  handleUnlinkIssue = () =>
    this.props.unlinkIssueAction(this.prepareDataToSend(), {
      fetchFunc: this.props.data.fetchFunc,
    });

  handleLinkIssue = () =>
    this.props.linkIssueAction(this.prepareDataToSend(), {
      fetchFunc: this.props.data.fetchFunc,
    });

  handlePostIssue = () =>
    this.props.postIssueAction(this.prepareDataToSend(), {
      fetchFunc: this.props.data.fetchFunc,
    });

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
        fetchFunc();
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
    this.setState((state) => ({
      selectedItems: checked ? state.testItems.slice() : [],
    }));
  };

  handleToggleItemSelect = (item, selected) => {
    if (selected) {
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

  render() {
    const { intl, currentLaunch, currentFilter } = this.props;
    const customButton = {
      onClick: this.onEditDefects,
      buttonProps: {
        items: this.multiActionButtonItems,
        title: intl.formatMessage(COMMON_LOCALE_KEYS.SAVE),
      },
      component: MultiActionButton,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: STEP_PAGE_EVENTS.CANCEL_BTN_EDIT_DEFECT_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        customButton={customButton}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={STEP_PAGE_EVENTS.CLOSE_ICON_EDIT_DEFECT_MODAL}
        className={cx('modal-window')}
        renderFooterElements={this.renderFooter}
      >
        <div className={cx('edit-defect-content')}>
          <div className={cx('defect-type')}>
            <span className={cx('defect-type-title')}>
              {intl.formatMessage(messages.defectTypeTitle)}
            </span>
            <div className={cx('defect-type-selector-wrapper')}>
              <DefectTypeSelector
                onChange={this.handleSelectDefectTypeChange}
                value={this.state.defectType}
                placeholder={intl.formatMessage(messages.defectTypeSelectorPlaceholder)}
              />
            </div>
          </div>
          <div className={cx('input-switcher-wrapper')}>
            <InputSwitcher
              value={this.state.ignoreAnalyzer}
              onChange={this.handleIgnoreAnalyzerChange}
            >
              <span className={cx('ignore-aa-title')}>
                {intl.formatMessage(messages.ignoreAaTitle)}
              </span>
            </InputSwitcher>
          </div>
          <div className={cx('markdown-container')}>
            <MarkdownEditor
              value={this.state.markdownValue}
              placeholder={intl.formatMessage(messages.defectCommentPlaceholder)}
              onChange={this.handleMarkdownChange}
            />
            <div className={cx('markdown-disable-cover')} />
          </div>
          <ItemsList
            testItems={this.state.testItems}
            selectedItems={this.state.selectedItems}
            currentLaunch={currentLaunch}
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
                {intl.formatMessage(messages.hotKeyCancelCaption)}
              </span>
              <span className={cx('hot-keys')}>
                <span className={cx('hot-key')}>Ctrl + Enter </span>
                {intl.formatMessage(messages.hotKeySubmitCaption)}
              </span>
            </div>
          </div>
        </div>
      </ModalLayout>
    );
  }
}
