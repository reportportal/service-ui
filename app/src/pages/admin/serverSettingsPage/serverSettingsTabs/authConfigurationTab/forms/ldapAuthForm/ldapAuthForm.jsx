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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import {
  validateLdapAttributes,
  prepareDataBeforeInitialize,
} from 'pages/admin/serverSettingsPage/common/utils';
import { FormController } from 'pages/admin/serverSettingsPage/common/formController';
import {
  messages,
  ENABLED_KEY,
  LDAP_ATTRIBUTES_KEY,
} from 'pages/admin/serverSettingsPage/common/constants';
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
  validate: ({ ldapAttributes }) => ({
    ldapAttributes: validateLdapAttributes(ldapAttributes),
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

  getSubmitUrl = (id) => URLS.authSettings(this.props.enabled ? LDAP_AUTH_TYPE : id);

  prepareDataBeforeSubmit = (data) => {
    const preparedData = {
      ...data,
      [LDAP_ATTRIBUTES_KEY]: {
        ...data[LDAP_ATTRIBUTES_KEY],
        [ENABLED_KEY]: data[ENABLED_KEY],
      },
    };
    if (!preparedData[PASSWORD_ENCODER_TYPE_KEY]) {
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
      initialConfigUrl: URLS.authSettings(LDAP_AUTH_TYPE),
      getSubmitUrl: this.getSubmitUrl,
      withErrorBlock: false,
      defaultFormConfig: DEFAULT_FORM_CONFIG,
    };

    return (
      <div className={cx('ldap-auth-form')}>
        <FormController
          enabled={enabled}
          prepareDataBeforeSubmit={this.prepareDataBeforeSubmit}
          prepareDataBeforeInitialize={prepareDataBeforeInitialize}
          initialize={initialize}
          formOptions={formOptions}
          handleSubmit={handleSubmit}
          successMessage={messages.updateAuthSuccess}
        />
      </div>
    );
  }
}
