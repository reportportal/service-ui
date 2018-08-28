import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { externalSystemSelector } from 'controllers/project';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { MarkdownEditor } from 'components/main/markdown';
import { DefectTypeSelector } from 'pages/inside/common/defectTypeSelector';
import {
  REPLACE_COMMENTS_TO_ALL_AVAILABILITY_NAME,
  DEFAULT_REPLACE_COMMENTS_TO_ALL_AVAILABILITY_VALUE,
} from './constants';
import styles from './editDefectModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  ignoreAaTitle: {
    id: 'editDefectModal.ignoreAaTitle',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  title: {
    id: 'editDefectModal.title',
    defaultMessage: 'Edit defect type',
  },
  replaceCommentsTitle: {
    id: 'editDefectModal.replaceCommentsTitle',
    defaultMessage: 'Replace comments to all selected items',
  },
  hotKeyCancelCaption: {
    id: 'editDefectModal.hotKeyCancelCaption',
    defaultMessage: 'to cancel',
  },
  hotKeySubmitCaption: {
    id: 'editDefectModal.hotKeySubmitCaption',
    defaultMessage: 'to submit',
  },
  defectTypeTitle: {
    id: 'editDefectModal.defectTypeTitle',
    defaultMessage: 'Defect type',
  },
  warningMessage: {
    id: 'editDefectModal.warningMessage',
    defaultMessage: 'You have to save changes or cancel them before closing the window',
  },
  saveAndPostIssueMessage: {
    id: 'editDefectModal.saveAndPostIssueMessage',
    defaultMessage: 'Save and post issue',
  },
  saveAndLinkIssueMessage: {
    id: 'editDefectModal.saveAndLinkIssueMessage',
    defaultMessage: 'Save and link issue',
  },
  saveAndUnlinkIssueMessage: {
    id: 'editDefectModal.saveAndUnlinkIssueMessage',
    defaultMessage: 'Save and unlink issue',
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
  },
)
export class EditDefectModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
    externalSystem: PropTypes.array.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
    }).isRequired,
    showNotification: PropTypes.func.isRequired,
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
        onClick: () => {},
        disabled: !externalSystem.length,
      },
      {
        label: intl.formatMessage(messages.saveAndLinkIssueMessage),
        value: 'Link',
        onClick: () => {},
        disabled: !externalSystem.length,
      },
      {
        label: intl.formatMessage(messages.saveAndUnlinkIssueMessage),
        value: 'Unlink',
        onClick: () => {},
        disabled: items.some(
          (item) => !item.issue.externalSystemIssue || !item.issue.externalSystemIssue.length,
        ),
      },
    ];

    this.state = {
      ...initialState,
    };
  }

  onEditDefects = (closeModal) => {
    const { items } = this.props.data;

    if (this.checkIfTheDataWasChanged()) {
      const issues = (this.isBulkEditOperation() &&
        items.map((item) => {
          const dataToSend = {
            test_item_id: item.id,
            issue: {
              ...item.issue,
            },
          };
          if (this.state.defectType) {
            dataToSend.issue.issue_type = this.state.defectType;
          }
          if (this.state.markdownValue) {
            dataToSend.issue.comment = this.state.markdownValue;
          }
          return dataToSend;
        })) || [
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

      this.fetchEditDefects(issues);
    }

    closeModal();
  };

  getReplaceCommentsToAllItemsAvailability = () => {
    const isReplaceToAllAvailable = localStorage.getItem(REPLACE_COMMENTS_TO_ALL_AVAILABILITY_NAME);

    !isReplaceToAllAvailable &&
      this.changeReplaceCommentsToAllAvailability(
        DEFAULT_REPLACE_COMMENTS_TO_ALL_AVAILABILITY_VALUE,
      );
    return isReplaceToAllAvailable
      ? JSON.parse(isReplaceToAllAvailable)
      : DEFAULT_REPLACE_COMMENTS_TO_ALL_AVAILABILITY_VALUE;
  };

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
      url,
      data: { fetchFunc },
    } = this.props;

    fetch(url, {
      method: 'put',
      data: {
        issues,
      },
    }).then(() => {
      fetchFunc();
      this.props.showNotification({
        message: 'SUCCES',
        type: NOTIFICATION_TYPES.SUCCESS,
      });
    });
  };

  isBulkEditOperation = () => this.props.data.items.length > 1;

  changeReplaceCommentsToAllAvailability = (value) => {
    localStorage.setItem(REPLACE_COMMENTS_TO_ALL_AVAILABILITY_NAME, value);
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
    const multiActionOkButton = {
      title: intl.formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: this.onEditDefects,
      items: this.multiActionButtonItems,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        multiActionOkButton={multiActionOkButton}
        cancelButton={cancelButton}
        stopOutsideClose={this.checkIfTheDataWasChanged()}
        warningMessage={
          (this.checkIfTheDataWasChanged() && intl.formatMessage(messages.warningMessage)) || ''
        }
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
