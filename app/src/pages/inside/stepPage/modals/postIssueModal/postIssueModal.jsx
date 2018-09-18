import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { JIRA, RALLY } from 'common/constants/integrationNames';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { namedAvailableBtsIntegrationsSelector } from 'controllers/project';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { DynamicFieldsSection } from 'components/fields/dynamicFieldsSection';
import {
  normalizeFieldsWithOptions,
  mapFieldsToValues,
} from 'components/fields/dynamicFieldsSection/utils';
import { URLS } from 'common/urls';
import { FieldProvider } from 'components/fields/fieldProvider';
import { fetch } from 'common/utils';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { INTEGRATION_NAMES_TITLES } from 'components/integrations';
import { BtsIntegrationSelector } from 'pages/inside/common/btsIntegrationSelector';
import { ISSUE_TYPE_FIELD_KEY } from 'components/integrations/elements/bts/constants';
import { JiraCredentials } from './jiraCredentials';
import { RallyCredentials } from './rallyCredentials';
import {
  INCLUDE_ATTACHMENTS_KEY,
  INCLUDE_LOGS_KEY,
  INCLUDE_COMMENTS_KEY,
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

const SYSTEM_CREDENTIALS_BLOCKS = {
  [JIRA]: JiraCredentials,
  [RALLY]: RallyCredentials,
};

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
  commentsHeader: {
    id: 'PostIssueModal.commentsHeader',
    defaultMessage: 'Comments',
  },
  credentialsHeader: {
    id: 'PostIssueModal.credentialsHeader',
    defaultMessage: '{system} Credentials:',
  },
  noDefaultPropertiesMessage: {
    id: 'PostIssueModal.noDefaultPropertiesMessage',
    defaultMessage: 'Configure Bug Tracking System integration default properties to post bugs',
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
    activeProject: activeProjectSelector(state),
    namedBtsIntegrations: namedAvailableBtsIntegrationsSelector(state),
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
    activeProject: PropTypes.string.isRequired,
    namedBtsIntegrations: PropTypes.object.isRequired,
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
    this.pluginNamesOptions = Object.keys(props.namedBtsIntegrations).map((key) => ({
      value: key,
      label: INTEGRATION_NAMES_TITLES[key],
    }));

    const pluginName = this.pluginNamesOptions[0].value;
    const {
      id,
      integrationParameters: { username, defectFormFields },
    } = props.namedBtsIntegrations[pluginName][0];
    const systemAuthConfig = {};
    const sessionConfig = getSessionStorageItem(SAVED_BTS_CREDENTIALS_KEY) || {};

    if (this.isJiraIntegration(pluginName)) {
      systemAuthConfig.password =
        (sessionConfig.user === props.userId && sessionConfig.password) || '';
      systemAuthConfig.username =
        (sessionConfig.user === props.userId && sessionConfig.username) || username;
    } else {
      systemAuthConfig.oauthAccessKey =
        (sessionConfig.user === props.userId && sessionConfig.oauthAccessKey) || '';
    }
    const fields = this.initIntegrationFields(defectFormFields, systemAuthConfig);

    this.state = {
      fields,
      pluginName,
      integrationId: id,
      expanded: !(sessionConfig.user === props.userId),
      wasExpanded: false,
    };
  }

  onPost = () => (closeModal) => {
    this.closeModal = closeModal;
    this.props.handleSubmit(this.prepareDataToSend)();
  };

  onChangePlugin = (pluginName) => {
    if (pluginName !== this.state.pluginName) {
      const { id, integrationParameters } = this.props.namedBtsIntegrations[pluginName][0];
      const defaultConfig = {};
      if (this.isJiraIntegration(pluginName)) {
        defaultConfig.username = integrationParameters.username;
      }
      const fields = this.initIntegrationFields(
        integrationParameters.defectFormFields,
        defaultConfig,
      );

      this.setState({
        pluginName,
        fields,
        integrationId: id,
      });
    }
  };

  onChangeIntegration = (integrationId) => {
    if (integrationId !== this.state.integrationId) {
      const { integrationParameters } = this.props.namedBtsIntegrations[this.state.pluginName].find(
        (item) => item.id === integrationId,
      );
      const defaultConfig = {};
      if (this.isJiraIntegration()) {
        defaultConfig.username = integrationParameters.username;
      }
      const fields = this.initIntegrationFields(
        integrationParameters.defectFormFields,
        defaultConfig,
      );

      this.setState({
        fields,
        integrationId,
      });
    }
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
    this.isBulkOperation ? BULK_INCLUDE_DATA_CONFIG : DEFAULT_INCLUDE_DATA_CONFIG;

  dataFieldsConfig = [
    {
      name: INCLUDE_ATTACHMENTS_KEY,
      title: this.props.intl.formatMessage(messages.attachmentsHeader),
    },
    {
      name: INCLUDE_LOGS_KEY,
      title: this.props.intl.formatMessage(messages.logsHeader),
    },
    {
      name: INCLUDE_COMMENTS_KEY,
      title: this.props.intl.formatMessage(messages.commentsHeader),
    },
  ];

  initIntegrationFields = (defectFormFields = [], defaultConfig = {}) => {
    const fields = normalizeFieldsWithOptions(defectFormFields).map(
      (item) => (item.fieldType === ISSUE_TYPE_FIELD_KEY ? { ...item, disabled: true } : item),
    );
    validationConfig = createFieldsValidationConfig(fields);
    this.props.initialize({
      ...defaultConfig,
      ...this.getDataSectionConfig(),
      ...mapFieldsToValues(fields),
    });

    return fields;
  };

  prepareDataToSend = (formData) => {
    const {
      data: { items },
    } = this.props;

    const fields = this.state.fields.map((field) => ({ ...field, value: formData[field.id] }));
    const backLinks = items.reduce(
      (acc, item) => ({ ...acc, [item.id]: `${window.location.toString()}/${item.id}/log` }),
      {},
    );
    const data = {
      [INCLUDE_COMMENTS_KEY]: formData[INCLUDE_COMMENTS_KEY],
      [INCLUDE_ATTACHMENTS_KEY]: formData[INCLUDE_ATTACHMENTS_KEY],
      [INCLUDE_LOGS_KEY]: formData[INCLUDE_LOGS_KEY],
      logQuantity: LOG_QUANTITY,
      item: items[0].id,
      fields,
      backLinks,
    };
    if (this.isJiraIntegration()) {
      data.password = formData.password;
      data.username = formData.username;
    } else {
      data.oauthAccessKey = formData.oauthAccessKey;
    }

    this.sendRequest(data);
  };

  sendRequest = (data) => {
    const {
      intl: { formatMessage },
      data: { items, fetchFunc },
      namedBtsIntegrations,
      activeProject,
      userId,
    } = this.props;
    const { pluginName, integrationId } = this.state;

    this.props.showScreenLockAction();

    fetch(URLS.btsIntegrationPostTicket(activeProject, this.state.integrationId), {
      method: 'post',
      data,
    })
      .then((response) => {
        const {
          integrationParameters: { project, url },
        } = namedBtsIntegrations[pluginName].find((item) => item.id === integrationId);
        const testItemIds = items.map((item) => item.id);
        const issues = [
          {
            ticketId: response.id,
            url: response.url,
            btsProject: project,
            btsUrl: url,
          },
        ];

        return fetch(URLS.testItemsLinkIssues(activeProject), {
          method: 'put',
          data: { issues, testItemIds },
        });
      })
      .then(() => {
        fetchFunc();
        this.props.hideScreenLockAction();
        this.closeModal();
        const sessionConfig = {
          user: userId,
        };
        if (this.isJiraIntegration()) {
          sessionConfig.password = data.password;
          sessionConfig.username = data.username;
        } else {
          sessionConfig.oauthAccessKey = data.oauthAccessKey;
        }
        setSessionStorageItem(SAVED_BTS_CREDENTIALS_KEY, sessionConfig);
        this.props.showNotification({
          message: formatMessage(messages.postIssueSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message: formatMessage(messages.postIssueFailed),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  isJiraIntegration = (pluginName = this.state.pluginName) => pluginName === JIRA;

  expandCredentials = () => {
    this.setState({
      expanded: !this.state.expanded,
      wasExpanded: true,
    });
  };

  isBulkOperation = this.props.data.items.length > 1;

  render() {
    const {
      intl: { formatMessage },
      namedBtsIntegrations,
    } = this.props;
    const okButton = {
      text: formatMessage(messages.postButton),
      disabled: !this.state.fields.length,
      onClick: this.onPost(),
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    const CredentialsComponent = SYSTEM_CREDENTIALS_BLOCKS[this.state.pluginName];

    return (
      <ModalLayout
        title={
          <span className={cx('post-issue-title')}>
            {formatMessage(messages.title)}
            <BetaBadge />
          </span>
        }
        okButton={okButton}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <form className={cx('post-issue-form')}>
          <BtsIntegrationSelector
            namedBtsIntegrations={namedBtsIntegrations}
            pluginName={this.state.pluginName}
            integrationId={this.state.integrationId}
            onChangeIntegration={this.onChangeIntegration}
            onChangePluginName={this.onChangePlugin}
          />
          {this.state.fields.length ? (
            <DynamicFieldsSection withValidation fields={this.state.fields} />
          ) : (
            <div className={cx('no-default-properties-message')}>
              {formatMessage(messages.noDefaultPropertiesMessage)}
            </div>
          )}
          {!this.isBulkOperation && (
            <Fragment>
              <h4 className={cx('form-block-header')}>
                <span className={cx('header-text')}>
                  {formatMessage(messages.includeDataHeader)}
                </span>
              </h4>
              <div className={cx('include-data-block')}>
                {this.dataFieldsConfig.map((item) => (
                  <div key={item.name} className={cx('switch-field-block')}>
                    <span className={cx('switch-field-header')}>{item.title}</span>
                    <FieldProvider name={item.name} format={Boolean} parse={Boolean}>
                      <InputBigSwitcher />
                    </FieldProvider>
                  </div>
                ))}
              </div>
            </Fragment>
          )}
          <div className={cx('credentials-block-wrapper', { expanded: this.state.expanded })}>
            <h4 className={cx('form-block-header')}>
              <span onClick={this.expandCredentials} className={cx('header-text')}>
                {formatMessage(messages.credentialsHeader, {
                  system: this.state.pluginName,
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
