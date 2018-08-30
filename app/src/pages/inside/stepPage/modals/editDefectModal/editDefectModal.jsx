import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { externalSystemSelector } from 'controllers/project';
import { fetchTestItemsAction } from 'controllers/testItem';
import { unlinkIssueAction, linkIssueAction } from 'controllers/step';
import { hideModalAction } from 'controllers/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch, setStorageItem, getStorageItem } from 'common/utils';
import { URLS } from 'common/urls';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { MarkdownEditor } from 'components/main/markdown';
import { DefectTypeSelector } from 'pages/inside/common/defectTypeSelector';
import { MultiActionButton } from 'components/buttons/multiActionButton';
import {
  REPLACE_COMMENTS_TO_ALL_AVAILABILITY_NAME,
  DEFAULT_REPLACE_COMMENTS_TO_ALL_AVAILABILITY_VALUE,
} from './constants';
import styles from './editDefectModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  ignoreAaTitle: {
    id: 'EditDefectModal.ignoreAaTitle',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  title: {
    id: 'EditDefectModal.title',
    defaultMessage: 'Edit defect type',
  },
  replaceCommentsTitle: {
    id: 'EditDefectModal.replaceCommentsTitle',
    defaultMessage: 'Replace comments to all selected items',
  },
  hotKeyCancelCaption: {
    id: 'EditDefectModal.hotKeyCancelCaption',
    defaultMessage: 'to cancel',
  },
  hotKeySubmitCaption: {
    id: 'EditDefectModal.hotKeySubmitCaption',
    defaultMessage: 'to submit',
  },
  defectTypeTitle: {
    id: 'EditDefectModal.defectTypeTitle',
    defaultMessage: 'Defect type',
  },
  saveAndPostIssueMessage: {
    id: 'EditDefectModal.saveAndPostIssueMessage',
    defaultMessage: 'Save and post issue',
  },
  saveAndLinkIssueMessage: {
    id: 'EditDefectModal.saveAndLinkIssueMessage',
    defaultMessage: 'Save and link issue',
  },
  saveAndUnlinkIssueMessage: {
    id: 'EditDefectModal.saveAndUnlinkIssueMessage',
    defaultMessage: 'Save and unlink issue',
  },
  updateDefectsSuccess: {
    id: 'EditDefectModal.updateDefectsSuccess',
    defaultMessage: 'Defects have been updated',
  },
  updateDefectsFailed: {
    id: 'EditDefectModal.updateDefectsFailed',
    defaultMessage: 'Failed to update defects',
  },
});

@withModal('editDefectModal')
@injectIntl
@connect(
  (state) => ({
    externalSystem: externalSystemSelector(state),
    url: URLS.testItems(activeProjectSelector(state)),
  }),
  {
    showNotification,
    hideModalAction,
    fetchTestItemsAction,
    unlinkIssueAction,
    linkIssueAction,
  },
)
export class EditDefectModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    url: PropTypes.string.isRequired,
    externalSystem: PropTypes.array.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
    }).isRequired,
    showNotification: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
    fetchTestItemsAction: PropTypes.func.isRequired,
    unlinkIssueAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const {
      intl,
      externalSystem,
      data: { items },
    } = props;
    const initialState = {};

    if (this.isBulkEditOperation()) {
      initialState.isReplaceCommentsToAllAvailable = this.getReplaceCommentsToAllItemsAvailability();
      initialState.markdownValue = '';
      initialState.defectType = '';
    } else {
      initialState.ignoreAnalyzer = items[0].issue.ignoreAnalyzer;
      initialState.markdownValue = items[0].issue.comment || '';
      initialState.defectType = items[0].issue.issue_type;
    }

    this.multiActionButtonItems = [
      {
        label: intl.formatMessage(messages.saveAndPostIssueMessage),
        value: 'Post',
        onClick: () => this.onEditDefects(this.handlePostIssue, true),
        disabled: !externalSystem.length,
      },
      {
        label: intl.formatMessage(messages.saveAndLinkIssueMessage),
        value: 'Link',
        onClick: () => this.onEditDefects(this.handleLinkIssue, true),
        disabled: !externalSystem.length,
      },
      {
        label: intl.formatMessage(messages.saveAndUnlinkIssueMessage),
        value: 'Unlink',
        onClick: () => this.onEditDefects(this.handleUnlinkIssue, true),
        disabled: this.isBulkEditOperation()
          ? !externalSystem.length
          : !items[0].issue.externalSystemIssues || !items[0].issue.externalSystemIssues.length,
      },
    ];

    this.state = {
      ...initialState,
    };
  }

  onEditDefects = (nextAction, issueAction) => {
    if (this.checkIfTheDataWasChanged()) {
      this.fetchEditDefects(this.prepareDataToSend());
    }
    issueAction && this.props.hideModalAction();
    nextAction();
  };

  getReplaceCommentsToAllItemsAvailability = () => {
    const isReplaceToAllAvailable = getStorageItem(REPLACE_COMMENTS_TO_ALL_AVAILABILITY_NAME);

    isReplaceToAllAvailable === null &&
      this.changeReplaceCommentsToAllAvailability(
        DEFAULT_REPLACE_COMMENTS_TO_ALL_AVAILABILITY_VALUE,
      );
    return getStorageItem(REPLACE_COMMENTS_TO_ALL_AVAILABILITY_NAME);
  };

  getCloseConfirmationConfig = () => {
    if (!this.checkIfTheDataWasChanged()) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  getItemsToTheNextAction = () =>
    this.prepareDataToSend().map((item) => ({ ...item, id: item.test_item_id }));

  prepareDataToSend = () => {
    const { items } = this.props.data;
    let issues = null;

    if (this.isBulkEditOperation()) {
      issues = items.map((item) => {
        const dataToSend = {
          test_item_id: item.id,
          issue: {
            ...item.issue,
            autoAnalyzed: false,
          },
        };
        if (this.state.defectType) {
          dataToSend.issue.issue_type = this.state.defectType;
        }
        if (this.state.markdownValue) {
          dataToSend.issue.comment = this.state.markdownValue;
        }
        return dataToSend;
      });
    } else {
      issues = [
        {
          test_item_id: items[0].id,
          issue: {
            ...items[0].issue,
            comment: this.state.markdownValue,
            issue_type: this.state.defectType,
            ignoreAnalyzer: this.state.ignoreAnalyzer,
            autoAnalyzed: false,
          },
        },
      ];
    }
    return issues;
  };

  handleUnlinkIssue = () =>
    this.props.unlinkIssueAction(this.getItemsToTheNextAction(), {
      fetchFunc: this.props.data.fetchFunc,
    });

  handleLinkIssue = () =>
    this.props.linkIssueAction(this.getItemsToTheNextAction(), {
      fetchFunc: this.props.data.fetchFunc,
    });

  handlePostIssue = () => {}; // TODO

  checkIfTheDataWasChanged = () => {
    const { items } = this.props.data;
    let isDataChanged = false;

    if (this.isBulkEditOperation()) {
      isDataChanged = Boolean(
        this.state.defectType ||
          (this.state.isReplaceCommentsToAllAvailable && this.state.markdownValue),
      );
    } else {
      isDataChanged =
        this.state.markdownValue !== items[0].issue.comment ||
        this.state.ignoreAnalyzer !== items[0].issue.ignoreAnalyzer ||
        this.state.defectType !== items[0].issue.issue_type;
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

  isBulkEditOperation = () => this.props.data.items.length > 1;

  changeReplaceCommentsToAllAvailability = (value) => {
    setStorageItem(REPLACE_COMMENTS_TO_ALL_AVAILABILITY_NAME, value);
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

  handleReplaceCommentsToAllChange = () => {
    this.changeReplaceCommentsToAllAvailability(!this.state.isReplaceCommentsToAllAvailable);
    this.setState({
      isReplaceCommentsToAllAvailable: !this.state.isReplaceCommentsToAllAvailable,
    });
  };

  render() {
    const { intl } = this.props;
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
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        customButton={customButton}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
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
                placeholder="Choose defect type"
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
                  {intl.formatMessage(messages.ignoreAaTitle)}
                </span>
              </InputSwitcher>
            </div>
          )}
          <div
            className={cx('markdown-container', {
              disabled: this.isBulkEditOperation() && !this.state.isReplaceCommentsToAllAvailable,
            })}
          >
            <MarkdownEditor
              value={this.state.markdownValue}
              placeholder={'Leave comment to defect type'}
              onChange={this.handleMarkdownChange}
            />
            <div className={cx('markdown-disable-cover')} />
          </div>
          <div className={cx('edit-defect-bottom-row')}>
            {this.isBulkEditOperation() && (
              <div className={cx('replace-comments-checkbox')}>
                <InputCheckbox
                  value={this.state.isReplaceCommentsToAllAvailable}
                  onChange={this.handleReplaceCommentsToAllChange}
                >
                  {intl.formatMessage(messages.replaceCommentsTitle)}
                </InputCheckbox>
              </div>
            )}
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
