import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { externalSystemSelector } from 'controllers/project';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  DynamicFieldsBlock,
  FieldItem,
  normalizeFieldsWithOptions,
} from 'pages/inside/common/dynamicFieldsBlock';
import { URLS } from 'common/urls';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldProvider } from 'components/fields/fieldProvider';
import { fetch } from 'common/utils';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import {
  JiraCredentials,
  RallyCredentials,
} from 'pages/inside/common/externalSystemCredentialsBlock';
import { DEFAULT_JIRA_CONFIG } from 'pages/inside/common/externalSystemCredentialsBlock/constants';
import {
  INCLUDE_ATTACHMENTS_KEY,
  INCLUDE_LOGS_KEY,
  INCLUDE_COMMENT_KEY,
  DEFAULT_INCLUDE_DATA_CONFIG,
  BULK_INCLUDE_DATA_CONFIG,
  LOG_QUANTITY,
  SAVED_BTS_CREDENTIALS_KEY,
} from './constants';
import {
  validate,
  createFieldsValidationConfig,
  getSessionStorageItem,
  setSessionStorageItem,
} from './utils';
import styles from './postIssueModal.scss';

const cx = classNames.bind(styles);

let validationConfig = null;

const messages = defineMessages({
  postButton: {
    id: 'PostIssueModal.postButton',
    defaultMessage: 'Post',
  },
  title: {
    id: 'PostIssueModal.title',
    defaultMessage: 'Post issue',
  },
  projectNameTitle: {
    id: 'PostIssueModal.projectNameTitle',
    defaultMessage: 'Project name JIRA',
  },
  systemUrlInfo: {
    id: 'PostIssueModal.systemUrlInfo',
    defaultMessage: 'Issue will be posted to {systemUrl}',
  },
  includeDataHeader: {
    id: 'PostIssueModal.includeDataHeader',
    defaultMessage: 'Include data',
  },
  attachmentsHeader: {
    id: 'PostIssueModal.attachmentsHeader',
    defaultMessage: 'Attachments',
  },
  logsHeader: {
    id: 'PostIssueModal.logsHeader',
    defaultMessage: 'Logs',
  },
  commentHeader: {
    id: 'PostIssueModal.commentHeader',
    defaultMessage: 'Comment',
  },
  credentialsHeader: {
    id: 'PostIssueModal.credentialsHeader',
    defaultMessage: '{system} Credentials:',
  },
  noDefaultPropertiesMessage: {
    id: 'PostIssueModal.noDefaultPropertiesMessage',
    defaultMessage: 'Configure Bug Tracking System default properties to post bugs',
  },
  postIssueSuccess: {
    id: 'PostIssueModal.postIssueSuccess',
    defaultMessage: 'Ticket has been created.',
  },
  postIssueFailed: {
    id: 'PostIssueModal.postIssueFailed',
    defaultMessage: 'Failed to post issue',
  },
});

@withModal('postIssueModal')
@reduxForm({
  form: 'postIssueForm',
  validate: (fields) => validate(fields, validationConfig),
})
@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
    externalSystems: externalSystemSelector(state),
    userId: userIdSelector(state),
  }),
  {
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
  },
)
@injectIntl
export class PostIssueModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentProject: PropTypes.string.isRequired,
    externalSystems: PropTypes.array.isRequired,
    userId: PropTypes.string.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.fieldsCustomClasses = {
      labelClassName: cx('issue-field-title'),
      fieldClassName: cx('issue-field-wrapper'),
      dateFieldClassName: cx('date-field-wrapper'),
    };
    this.dropdownOptions = props.externalSystems.map((item) => ({
      value: item.id,
      label: item.project,
    }));
    const fields = normalizeFieldsWithOptions(props.externalSystems[0].fields || []);
    const systemAuthConfig = {
      systemAuth: props.externalSystems[0].systemAuth,
    };
    const sessionConfig = getSessionStorageItem(SAVED_BTS_CREDENTIALS_KEY) || {};

    if (this.isJiraSystem()) {
      this.systemCredentialsBlock = JiraCredentials;
      systemAuthConfig.password =
        (sessionConfig.user === props.userId && sessionConfig.password) || '';
      systemAuthConfig.username =
        (sessionConfig.user === props.userId && sessionConfig.username) || '';
    } else {
      this.systemCredentialsBlock = RallyCredentials;
      systemAuthConfig.accessKey =
        (sessionConfig.user === props.userId && sessionConfig.accessKey) || '';
    }
    validationConfig = createFieldsValidationConfig(fields);

    this.props.initialize({
      ...this.getDataSectionConfig(),
      ...systemAuthConfig,
      ...this.mapFieldsToValues(fields),
    });

    this.state = {
      systemUrl: props.externalSystems[0].url,
      activeSystem: this.dropdownOptions[0].value,
      fields,
      expanded: !(sessionConfig.user === props.userId),
      wasExpanded: false,
    };
  }

  onPost = () => (closeModal) => {
    this.closeModal = closeModal;
    this.props.handleSubmit(this.prepareDataToSend)();
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  getDataSectionConfig = () =>
    this.isBulkOperation() ? BULK_INCLUDE_DATA_CONFIG : DEFAULT_INCLUDE_DATA_CONFIG;

  prepareDataToSend = (formData) => {
    const {
      data: { items },
    } = this.props;

    if (!this.state.fields.length) {
      return;
    }

    const fields = this.state.fields.map((field) => {
      const value = formData[field.id];
      return {
        ...field,
        value,
      };
    });
    const backLinks = {};
    items.forEach((item) => {
      backLinks[item.id] = `${window.location.toString()}/${item.id}/log`;
    });
    const data = {
      include_comments: formData[INCLUDE_COMMENT_KEY],
      include_data: formData[INCLUDE_ATTACHMENTS_KEY],
      include_logs: formData[INCLUDE_LOGS_KEY],
      log_quantity: LOG_QUANTITY,
      item: items[0].id,
      fields,
      backLinks,
    };
    if (this.isJiraSystem()) {
      data.password = formData.password;
      data.username = formData.username;
    } else {
      data.accessKey = formData.accessKey;
    }
    this.props.showScreenLockAction();
    this.sendRequest(data);
  };

  sendRequest = (data) => {
    const {
      intl,
      currentProject,
      data: { items, fetchFunc },
    } = this.props;

    fetch(URLS.externalSystemIssue(currentProject, this.state.activeSystem), {
      method: 'post',
      data,
    })
      .then((response) => {
        const issues = items.map((item) => ({
          issue: {
            ...item.issue,
            externalSystemIssues: [
              ...item.issue.externalSystemIssues,
              {
                systemId: this.state.activeSystem,
                ticketId: response.id,
                url: response.url,
              },
            ],
          },
          test_item_id: item.id,
        }));
        return fetch(URLS.testItem(currentProject), {
          method: 'put',
          data: { issues },
        });
      })
      .then(() => {
        fetchFunc();
        this.props.hideScreenLockAction();
        this.closeModal();
        const sessionConfig = {
          user: this.props.userId,
        };
        if (this.isJiraSystem()) {
          sessionConfig.password = data.password;
          sessionConfig.username = data.username;
        } else {
          sessionConfig.accessKey = data.accessKey;
        }
        setSessionStorageItem(SAVED_BTS_CREDENTIALS_KEY, sessionConfig);
        this.props.showNotification({
          message: intl.formatMessage(messages.postIssueSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message: intl.formatMessage(messages.postIssueFailed),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  isJiraSystem = () => this.props.externalSystems[0].systemType === DEFAULT_JIRA_CONFIG.systemType;

  mapFieldsToValues = (fields) => {
    const valuesMap = {};
    fields.forEach((field) => {
      valuesMap[field.id] = field.value;
    });
    return valuesMap;
  };

  handleActiveSystemChange = (value) => {
    if (value && value !== this.state.activeSystem) {
      const currentExternalSystem = this.props.externalSystems.find(
        (system) => system.id === value,
      );
      const fields = normalizeFieldsWithOptions(currentExternalSystem.fields || []);
      validationConfig = createFieldsValidationConfig(fields);

      this.props.initialize({
        ...this.getDataSectionConfig(),
        ...this.mapFieldsToValues(fields),
      });
      this.setState({
        systemUrl: currentExternalSystem.url,
        activeSystem: value,
        fields,
      });
    }
  };

  expandCredentials = () => {
    this.setState({
      expanded: !this.state.expanded,
      wasExpanded: true,
    });
  };

  isBulkOperation = () => this.props.data.items.length > 1;

  isMultipleExternalSystems = () => this.props.externalSystems.length > 1;

  render() {
    const { intl } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.postButton),
      onClick: this.onPost(),
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    const CredentialsComponent = this.systemCredentialsBlock;

    return (
      <ModalLayout
        title={
          <span className={cx('post-issue-title')}>
            {intl.formatMessage(messages.title)}
            <BetaBadge />
          </span>
        }
        okButton={okButton}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <form className={cx('post-issue-form')}>
          {this.isMultipleExternalSystems() && (
            <div className={cx('multiple-systems-block')}>
              <FieldItem
                fieldClassName={cx('issue-field-wrapper')}
                withoutForm
                required
                label={intl.formatMessage(messages.projectNameTitle)}
                labelClassName={cx('issue-field-title')}
              >
                <InputDropdown
                  value={this.state.activeSystem}
                  onChange={this.handleActiveSystemChange}
                  options={this.dropdownOptions}
                />
              </FieldItem>
              <span className={cx('active-system-info')}>
                {intl.formatMessage(messages.systemUrlInfo, { systemUrl: this.state.systemUrl })}
              </span>
            </div>
          )}
          <div className={cx('dynamic-fields-wrapper')}>
            <DynamicFieldsBlock
              customClasses={this.fieldsCustomClasses}
              fields={this.state.fields}
            />
          </div>
          {!this.state.fields.length && (
            <div className={cx('no-default-properties-message')}>
              {intl.formatMessage(messages.noDefaultPropertiesMessage)}
            </div>
          )}
          {!this.isBulkOperation() && (
            <Fragment>
              <h4 className={cx('form-block-header')}>
                <span className={cx('header-text')}>
                  {intl.formatMessage(messages.includeDataHeader)}
                </span>
              </h4>
              <div className={cx('include-data-block')}>
                <div className={cx('switch-field-block')}>
                  <span className={cx('switch-field-header')}>
                    {intl.formatMessage(messages.attachmentsHeader)}
                  </span>
                  <FieldProvider name={INCLUDE_ATTACHMENTS_KEY} format={Boolean} parse={Boolean}>
                    <InputBigSwitcher />
                  </FieldProvider>
                </div>

                <div className={cx('switch-field-block')}>
                  <span className={cx('switch-field-header')}>
                    {intl.formatMessage(messages.logsHeader)}
                  </span>
                  <FieldProvider name={INCLUDE_LOGS_KEY} format={Boolean} parse={Boolean}>
                    <InputBigSwitcher />
                  </FieldProvider>
                </div>

                <div className={cx('switch-field-block')}>
                  <span className={cx('switch-field-header')}>
                    {intl.formatMessage(messages.commentHeader)}
                  </span>
                  <FieldProvider name={INCLUDE_COMMENT_KEY} format={Boolean} parse={Boolean}>
                    <InputBigSwitcher />
                  </FieldProvider>
                </div>
              </div>
            </Fragment>
          )}
          <div className={cx('credentials-block-wrapper', { expanded: this.state.expanded })}>
            <h4 className={cx('form-block-header')}>
              <span onClick={this.expandCredentials} className={cx('header-text')}>
                {intl.formatMessage(messages.credentialsHeader, {
                  system: this.props.externalSystems[0].systemType,
                })}
              </span>
            </h4>
            <div className={cx('credentials-block', { expand: this.state.wasExpanded })}>
              <CredentialsComponent />
            </div>
          </div>
        </form>
      </ModalLayout>
    );
  }
}
