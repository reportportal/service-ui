import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import classNames from 'classnames/bind';
import { validate, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import WarningIcon from 'common/img/error-inline.svg';
import { fetchProjectIntegrationsAction } from 'controllers/project';
import { projectIdSelector } from 'controllers/pages';
import { INTEGRATION_ENABLED_KEY } from 'components/integrations';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FormField } from 'components/fields/formField';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { BigButton } from 'components/buttons/bigButton';
import { EMAIL_SERVER_FORM, DEFAULT_FORM_CONFIG, INTEGRATION_PARAMETERS_KEY } from './constants';
import { EmailIntegrationFormFields } from './emailIntegrationFormFields';
import styles from './emailIntegration.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  emailSwitcher: {
    id: 'EmailIntegration.emailSwitcher',
    defaultMessage: 'Enable email server',
  },
  updateEmailServerSuccess: {
    id: 'EmailIntegration.updateEmailServerSuccess',
    defaultMessage: 'Email integration has been updated',
  },
  warningMessage: {
    id: 'EmailIntegration.warningMessage',
    defaultMessage: 'Test connection was failed:',
  },
  integrationTypeTitle: {
    id: 'EmailIntegration.integrationTypeTitle',
    defaultMessage: 'Integration type',
  },
  projectIntegrationType: {
    id: 'EmailIntegration.projectIntegrationType',
    defaultMessage: 'Project',
  },
  instanceIntegrationType: {
    id: 'EmailIntegration.instanceIntegrationType',
    defaultMessage: 'Instance',
  },
});

@reduxForm({
  form: EMAIL_SERVER_FORM,
  validate: ({ integrationParameters: { host, port } = {} }) => ({
    integrationParameters: {
      host: !host && 'requiredFieldHint',
      port: (!port || !validate.inRangeValidate(port, 1, 65535)) && 'portFieldHint',
    },
  }),
})
@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    enabled: formValueSelector(EMAIL_SERVER_FORM)(state, INTEGRATION_ENABLED_KEY),
  }),
  {
    showNotification,
    fetchProjectIntegrationsAction,
  },
)
@injectIntl
export class EmailIntegration extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    instances: PropTypes.array.isRequired,
    projectId: PropTypes.string,
    enabled: PropTypes.bool,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
    change: PropTypes.func,
    showNotification: PropTypes.func,
    fetchProjectIntegrationsAction: PropTypes.func,
  };

  static defaultProps = {
    projectId: '',
    enabled: false,
    initialize: () => {},
    handleSubmit: () => {},
    change: () => {},
    showNotification: () => {},
    fetchProjectIntegrationsAction: () => {},
  };

  state = {
    loading: false,
    errorMessage: '',
  };

  componentDidMount() {
    this.initializeForm(this.props.instances[0]);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.instances[0].id !== this.props.instances[0].id) {
      this.initializeForm(this.props.instances[0]);
    }
  }

  onFormSubmit = (data) => {
    this.setState({
      loading: true,
      errorMessage: '',
    });
    const emailInstance = this.props.instances[0];
    const isProjectInstance = !!emailInstance.projectId;
    fetch(URLS.integration(this.props.projectId, isProjectInstance ? emailInstance.id : ''), {
      data,
      method: isProjectInstance ? 'PUT' : 'POST',
    })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateEmailServerSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchProjectIntegrationsAction(this.props.projectId);
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          errorMessage: error.message,
        });
      });
  };

  initializeForm = (emailInstance) => {
    const data = {
      ...DEFAULT_FORM_CONFIG,
      [INTEGRATION_ENABLED_KEY]: emailInstance.enabled,
      [INTEGRATION_PARAMETERS_KEY]: {
        ...emailInstance[INTEGRATION_PARAMETERS_KEY],
      },
      integrationName: emailInstance.integrationType.name,
    };
    this.props.initialize(data);
  };

  render() {
    const {
      intl: { formatMessage },
      enabled,
      handleSubmit,
    } = this.props;
    const emailInstance = this.props.instances[0];
    const integrationTypeMessage = emailInstance.projectId
      ? messages.projectIntegrationType
      : messages.instanceIntegrationType;

    return (
      <form className={cx('email-integration')} onSubmit={handleSubmit(this.onFormSubmit)}>
        {this.state.loading ? (
          <SpinningPreloader />
        ) : (
          <Fragment>
            <FormField
              name={INTEGRATION_ENABLED_KEY}
              label={formatMessage(messages.emailSwitcher)}
              labelClassName={cx('label')}
              format={Boolean}
              parse={Boolean}
            >
              <InputBigSwitcher mobileDisabled />
            </FormField>
            <FormField
              label={formatMessage(messages.integrationTypeTitle)}
              labelClassName={cx('label')}
              withoutProvider
            >
              <span className={cx('integration-type-message')}>
                {formatMessage(integrationTypeMessage)}
              </span>
            </FormField>
          </Fragment>
        )}
        {enabled && <EmailIntegrationFormFields changeFieldValue={this.props.change} />}
        <BigButton
          className={cx('submit-button')}
          disabled={this.state.loading}
          type="submit"
          mobileDisabled
        >
          <span className={cx('submit-button-title')}>
            {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
          </span>
        </BigButton>
        {this.state.errorMessage && (
          <div className={cx('error-message-block')}>
            <strong className={cx('warning-wrapper')}>
              <div className={cx('warning-icon')}>{Parser(WarningIcon)}</div>
              <span className={cx('warning-message')}>
                {formatMessage(messages.warningMessage)}
              </span>
            </strong>
            <div className={cx('error-message')}>{this.state.errorMessage}</div>
          </div>
        )}
      </form>
    );
  }
}
