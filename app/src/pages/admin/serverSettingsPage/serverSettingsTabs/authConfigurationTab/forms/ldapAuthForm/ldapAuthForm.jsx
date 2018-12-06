import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { validate } from 'common/utils';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { FormController } from '../../../common/formController';
import { messages, ENABLED_KEY } from '../../../common/constants';
import {
  LDAP_AUTH_FORM,
  DEFAULT_FORM_CONFIG,
  LDAP_AUTH_TYPE,
  PASSWORD_ATTRIBUTE_KEY,
  PASSWORD_ENCODER_TYPE_KEY,
} from './constants';
import { LdapAuthFormFields } from './ldapAuthFormFields';
import styles from './ldapAuthForm.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  switcherLabel: {
    id: 'LdapAuthForm.switcherLabel',
    defaultMessage: 'LDAP authorization',
  },
});

const ldapHeader = (
  <div className={cx('label-container')}>
    Ldap
    <BetaBadge className={cx('beta')} />
  </div>
);

@reduxForm({
  form: LDAP_AUTH_FORM,
  validate: ({ url, baseDn, synchronizationAttributes }) => ({
    url: (!url || !validate.urlPart(url)) && 'requiredFieldHint',
    baseDn: !baseDn && 'requiredFieldHint',
    synchronizationAttributes: {
      email:
        (!synchronizationAttributes || !synchronizationAttributes.email) && 'requiredFieldHint',
    },
  }),
  initialValues: DEFAULT_FORM_CONFIG,
})
@connect((state) => ({
  enabled: formValueSelector(LDAP_AUTH_FORM)(state, ENABLED_KEY),
}))
export class LdapAuthForm extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  static defaultProps = {
    enabled: false,
    initialize: () => {},
    handleSubmit: () => {},
  };

  commonUrl = URLS.authSettings(LDAP_AUTH_TYPE);

  prepareDataBeforeSubmit = (data) => {
    const preparedData = { ...data };
    if (!preparedData[PASSWORD_ENCODER_TYPE_KEY]) {
      delete preparedData[PASSWORD_ENCODER_TYPE_KEY];
      delete preparedData[PASSWORD_ATTRIBUTE_KEY];
    }
    return preparedData;
  };

  render() {
    const { enabled, initialize, handleSubmit } = this.props;

    const formOptions = {
      formHeader: ldapHeader,
      switcherLabel: localMessages.switcherLabel,
      FieldsComponent: LdapAuthFormFields,
      initialConfigUrl: this.commonUrl,
      submitFormUrl: this.commonUrl,
      withErrorBlock: false,
      defaultFormConfig: DEFAULT_FORM_CONFIG,
    };

    return (
      <div className={cx('ldap-auth-form')}>
        <FormController
          enabled={enabled}
          prepareDataBeforeSubmit={this.prepareDataBeforeSubmit}
          initialize={initialize}
          formOptions={formOptions}
          handleSubmit={handleSubmit}
          successMessage={messages.updateAuthSuccess}
        />
      </div>
    );
  }
}
