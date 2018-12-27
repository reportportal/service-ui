import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { validate } from 'common/utils';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import classNames from 'classnames/bind';
import { ENABLED_KEY } from '../common/constants';
import { EMAIL_SERVER_FORM, DEFAULT_FORM_CONFIG } from './constants';
import { EmailServerTabFormFields } from './emailServerTabFormFields';
import { FormController } from '../common/formController';
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
});

@reduxForm({
  form: EMAIL_SERVER_FORM,
  validate: ({ host, port }) => ({
    host: !host && 'requiredFieldHint',
    port: (!port || !validate.inRangeValidate(port, 1, 65535)) && 'portFieldHint',
  }),
  initialValues: DEFAULT_FORM_CONFIG,
})
@connect((state) => ({
  enabled: formValueSelector(EMAIL_SERVER_FORM)(state, ENABLED_KEY),
}))
export class EmailServerTab extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
    change: PropTypes.func,
  };

  static defaultProps = {
    enabled: false,
    initialize: () => {},
    handleSubmit: () => {},
    change: () => {},
  };

  getSubmitUrl = () => URLS.emailServerSettings();

  prepareDataBeforeInitialize = (data) => ({
    [ENABLED_KEY]: !!data.serverEmailConfig,
    ...DEFAULT_FORM_CONFIG,
    ...(data.serverEmailConfig || {}),
  });

  initialConfigUrl = URLS.serverSettings();

  render() {
    const { enabled, initialize, handleSubmit } = this.props;

    const formOptions = {
      switcherLabel: messages.emailSwitcher,
      FieldsComponent: EmailServerTabFormFields,
      initialConfigUrl: this.initialConfigUrl,
      getSubmitUrl: this.getSubmitUrl,
      withErrorBlock: false,
      defaultFormConfig: DEFAULT_FORM_CONFIG,
    };

    return (
      <div className={cx('email-server-tab')}>
        <FormController
          enabled={enabled}
          successMessage={messages.updateEmailServerSuccess}
          initialize={initialize}
          formOptions={formOptions}
          handleSubmit={handleSubmit}
          prepareDataBeforeInitialize={this.prepareDataBeforeInitialize}
        />
      </div>
    );
  }
}
