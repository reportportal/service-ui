import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { fetch, validate } from 'common/utils';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import Parser from 'html-react-parser';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FormField } from 'components/fields/formField';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import classNames from 'classnames/bind';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { BigButton } from 'components/buttons/bigButton';
import WarningIcon from 'common/img/error-inline.svg';
import { EMAIL_SERVER_FORM, EMAIL_ENABLED_KEY, DEFAULT_FORM_CONFIG } from './constants';
import { EmailServerTabFormFields } from './emailServerTabFormFields';
import styles from './emailServerTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  emailSwitcher: {
    id: 'EmailServerTab.emailSwitcher',
    defaultMessage: 'Enable email server',
  },
  updateEmailServerSuccess: {
    id: 'EmailServerTabFormFields.updateEmailServerSuccess',
    defaultMessage: 'Email server settings have been updated',
  },
  warningMessage: {
    id: 'EmailServerTabFormFields.warningMessage',
    defaultMessage: 'Test connection was failed:',
  },
});

@reduxForm({
  form: 'emailServerTabForm',
  validate: ({ host, port }) => ({
    host: !host && 'requiredFieldHint',
    port: (!port || !validate.inRangeValidate(port, 1, 65535)) && 'portFieldHint',
  }),
  initialValues: DEFAULT_FORM_CONFIG,
})
@connect(
  (state) => ({
    enabled: formValueSelector(EMAIL_SERVER_FORM)(state, [EMAIL_ENABLED_KEY]),
  }),
  {
    showNotification,
  },
)
@injectIntl
export class EmailServerTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabled: PropTypes.bool,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
    change: PropTypes.func,
    showNotification: PropTypes.func,
  };

  static defaultProps = {
    enabled: false,
    initialize: () => {},
    handleSubmit: () => {},
    change: () => {},
    showNotification: () => {},
  };

  state = {
    loading: true,
    errorMessage: '',
  };

  componentDidMount() {
    this.fetchEmailConfig();
  }

  onFormSubmit = (data) => {
    this.setState({
      loading: true,
      errorMessage: '',
    });
    const requestOptions = {
      method: this.props.enabled ? 'POST' : 'DELETE',
    };
    if (this.props.enabled) {
      requestOptions.data = data;
    }
    this.updateEmailConfig(requestOptions);
  };

  updateEmailConfig = (options) =>
    fetch(URLS.emailServerSettings(), options)
      .then(() => this.updateSettingSuccess(options.method))
      .catch(this.catchRequestError);

  fetchEmailConfig = () =>
    fetch(URLS.serverSettings())
      .then((data) => {
        const config = {
          [EMAIL_ENABLED_KEY]: !!data.serverEmailConfig,
          ...DEFAULT_FORM_CONFIG,
          ...(data.serverEmailConfig || {}),
        };
        this.props.initialize(config);
        this.setState({
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });

  updateSettingSuccess = (method) => {
    const {
      intl: { formatMessage },
    } = this.props;
    if (method === 'DELETE') {
      this.props.initialize(DEFAULT_FORM_CONFIG);
    }
    this.props.showNotification({
      message: formatMessage(messages.updateEmailServerSuccess),
      type: NOTIFICATION_TYPES.SUCCESS,
    });
    this.setState({
      loading: false,
    });
  };

  catchRequestError = (error) => {
    this.setState({
      loading: false,
      errorMessage: error.message,
    });
  };

  render() {
    const {
      intl: { formatMessage },
      enabled,
      handleSubmit,
      change,
    } = this.props;

    return (
      <div className={cx('email-server-tab')}>
        <form className={cx('email-server-form')} onSubmit={handleSubmit(this.onFormSubmit)}>
          {this.state.loading ? (
            <SpinningPreloader />
          ) : (
            <FormField
              name={EMAIL_ENABLED_KEY}
              label={formatMessage(messages.emailSwitcher)}
              labelClassName={cx('label')}
              containerClassName={cx('email-switcher')}
              format={Boolean}
              parse={Boolean}
            >
              <InputBigSwitcher mobileDisabled />
            </FormField>
          )}
          {enabled && <EmailServerTabFormFields changeFieldValue={change} />}
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
        </form>
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
        <div className={cx('mobile-disabling-cover')} />
      </div>
    );
  }
}
