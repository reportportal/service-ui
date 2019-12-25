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
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { FormController } from 'pages/admin/serverSettingsPage/common/formController';
import { ENABLED_KEY, messages } from 'pages/admin/serverSettingsPage/common/constants';
import { commonValidators } from 'common/utils/validation';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { joinOrganizations, splitOrganizations } from './utils';
import { GITHUB_AUTH_FORM, DEFAULT_FORM_CONFIG } from './constants';
import { GithubAuthFormFields } from './githubAuthFormFields';
import styles from './githubAuthForm.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  switcherLabel: {
    id: 'GithubAuthForm.switcherLabel',
    defaultMessage: 'GitHub authorization',
  },
  formHeader: {
    id: 'GithubAuthForm.formHeader',
    defaultMessage: 'Github',
  },
});

@reduxForm({
  form: GITHUB_AUTH_FORM,
  validate: ({ clientId, clientSecret }) => ({
    clientId: commonValidators.requiredField(clientId),
    clientSecret: commonValidators.requiredField(clientSecret),
  }),
  initialValues: DEFAULT_FORM_CONFIG,
})
@connect((state) => ({
  enabled: formValueSelector(GITHUB_AUTH_FORM)(state, ENABLED_KEY),
}))
@injectIntl
export class GithubAuthForm extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    enabled: PropTypes.bool,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  static defaultProps = {
    enabled: false,
    initialize: () => {},
    handleSubmit: () => {},
  };

  prepareDataBeforeSubmit = (data) => {
    const organizations = joinOrganizations(data.restrictions.organizations);
    return { ...data, restrictions: { organizations } };
  };

  prepareDataBeforeInitialize = (data) => ({
    ...data,
    restrictions: {
      organizations: splitOrganizations(data.restrictions.organizations),
    },
    [ENABLED_KEY]: true,
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
      FieldsComponent: GithubAuthFormFields,
      initialConfigUrl: URLS.githubAuthSettings(),
      getSubmitUrl: URLS.githubAuthSettings,
      withErrorBlock: false,
      defaultFormConfig: DEFAULT_FORM_CONFIG,
    };

    return (
      <div className={cx('github-auth-form')}>
        <FormController
          enabled={enabled}
          prepareDataBeforeSubmit={this.prepareDataBeforeSubmit}
          prepareDataBeforeInitialize={this.prepareDataBeforeInitialize}
          successMessage={messages.updateAuthSuccess}
          initialize={initialize}
          formOptions={formOptions}
          handleSubmit={handleSubmit}
          eventsInfo={{
            bigSwitcher: ADMIN_SERVER_SETTINGS_PAGE_EVENTS.ACTIVATE_GITHUB_SWITCHER,
            submitBtn: ADMIN_SERVER_SETTINGS_PAGE_EVENTS.SUBMIT_GITHUB_BTN,
          }}
        />
      </div>
    );
  }
}
