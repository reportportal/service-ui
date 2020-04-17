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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { commonValidators } from 'common/utils/validation';
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { Input } from 'components/inputs/input';
import { IntegrationFormField } from 'components/integrations/elements';
import { COMMON_BTS_MESSAGES } from 'components/integrations/elements/bts';
import { DEFAULT_FORM_CONFIG } from '../constants';
import { messages } from '../messages';

@injectIntl
export class JiraConnectionFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
    editAuthMode: PropTypes.bool,
    updateMetaData: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    authEnabled: false,
    lineAlign: false,
    initialData: DEFAULT_FORM_CONFIG,
    editAuthMode: false,
    updateMetaData: () => {},
  };

  constructor(props) {
    super(props);
    this.systemAuthTypes = [{ value: 'BASIC', label: 'Basic' }];
  }

  componentDidMount() {
    this.props.initialize(this.props.initialData);
    this.props.updateMetaData({
      [SECRET_FIELDS_KEY]: ['password'],
    });
  }

  render() {
    const {
      intl: { formatMessage },
      disabled,
      lineAlign,
      editAuthMode,
    } = this.props;

    return (
      <Fragment>
        <IntegrationFormField
          name="integrationName"
          label={formatMessage(COMMON_BTS_MESSAGES.integrationNameLabel)}
          required
          disabled={disabled}
          lineAlign={lineAlign}
          maxLength="55"
          validate={commonValidators.btsIntegrationName}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="url"
          label={formatMessage(COMMON_BTS_MESSAGES.linkToBtsLabel)}
          required
          disabled={disabled || editAuthMode}
          lineAlign={lineAlign}
          validate={commonValidators.btsUrl}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="project"
          label={formatMessage(messages.projectNameLabel)}
          required
          disabled={disabled || editAuthMode}
          lineAlign={lineAlign}
          maxLength="55"
          validate={commonValidators.btsProject}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="authType"
          label={formatMessage(COMMON_BTS_MESSAGES.authTypeLabel)}
          disabled={disabled}
          lineAlign={lineAlign}
        >
          <FieldErrorHint>
            <InputDropdown mobileDisabled options={this.systemAuthTypes} />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="username"
          label={formatMessage(messages.usernameLabel)}
          required
          disabled={disabled}
          lineAlign={lineAlign}
          maxLength="55"
          validate={commonValidators.requiredField}
        >
          <FieldErrorHint>
            <Input type="text" mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="password"
          label={formatMessage(messages.passwordLabel)}
          required
          disabled={disabled}
          lineAlign={lineAlign}
          maxLength="55"
          validate={commonValidators.requiredField}
        >
          <FieldErrorHint>
            <Input type="password" mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
      </Fragment>
    );
  }
}
