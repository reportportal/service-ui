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
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { FormController } from 'pages/admin/serverSettingsPage/common/formController';
import {
  validateLdapAttributes,
  prepareDataBeforeInitialize,
} from 'pages/admin/serverSettingsPage/common/utils';
import { commonValidators } from 'common/utils';
import {
  messages,
  ENABLED_KEY,
  LDAP_ATTRIBUTES_KEY,
} from 'pages/admin/serverSettingsPage/common/constants';
import { AD_AUTH_FORM, DEFAULT_FORM_CONFIG, AD_AUTH_TYPE } from './constants';
import { ActiveDirectoryAuthFormFields } from './activeDirectoryAuthFormFields';
import styles from './activeDirectoryAuthForm.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  switcherLabel: {
    id: 'ActiveDirectoryAuthForm.switcherLabel',
    defaultMessage: 'Active directory authorization',
  },
  formHeader: {
    id: 'ActiveDirectoryAuthForm.formHeader',
    defaultMessage: 'Active directory',
  },
});

@reduxForm({
  form: AD_AUTH_FORM,
  validate: ({ domain, ldapAttributes }) => ({
    domain: commonValidators.requiredField(domain),
    ldapAttributes: validateLdapAttributes(ldapAttributes),
  }),
  initialValues: DEFAULT_FORM_CONFIG,
})
@connect((state) => ({
  enabled: formValueSelector(AD_AUTH_FORM)(state, ENABLED_KEY),
}))
@injectIntl
export class ActiveDirectoryAuthForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabled: PropTypes.bool,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  static defaultProps = {
    enabled: false,
    initialize: () => {},
    handleSubmit: () => {},
  };

  getSubmitUrl = (id) => URLS.authSettings(this.props.enabled ? AD_AUTH_TYPE : id);

  prepareDataBeforeSubmit = (data) => ({
    ...data,
    [LDAP_ATTRIBUTES_KEY]: {
      ...data[LDAP_ATTRIBUTES_KEY],
      [ENABLED_KEY]: data[ENABLED_KEY],
    },
  });

  render() {
    const {
      intl: { formatMessage },
      enabled,
      initialize,
      handleSubmit,
    } = this.props;

    const formOptions = {
      formHeader: formatMessage(localMessages.formHeader),
      switcherLabel: localMessages.switcherLabel,
      FieldsComponent: ActiveDirectoryAuthFormFields,
      initialConfigUrl: URLS.authSettings(AD_AUTH_TYPE),
      getSubmitUrl: this.getSubmitUrl,
      withErrorBlock: false,
      defaultFormConfig: DEFAULT_FORM_CONFIG,
    };

    return (
      <div className={cx('active-directory-auth-form')}>
        <FormController
          enabled={enabled}
          prepareDataBeforeSubmit={this.prepareDataBeforeSubmit}
          prepareDataBeforeInitialize={prepareDataBeforeInitialize}
          successMessage={messages.updateAuthSuccess}
          initialize={initialize}
          formOptions={formOptions}
          handleSubmit={handleSubmit}
        />
      </div>
    );
  }
}
