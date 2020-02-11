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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { formValueSelector } from 'redux-form';
import { defineMessages, injectIntl } from 'react-intl';
import {
  validate,
  commonValidators,
  bindMessageToValidator,
  composeBoundValidators,
} from 'common/utils/validation';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { IntegrationFormField, INTEGRATION_FORM } from 'components/integrations/elements';
import {
  DEFAULT_FORM_CONFIG,
  AUTH_ENABLED_KEY,
  PROTOCOL_KEY,
  SSL_KEY,
  TLS_KEY,
  FROM_KEY,
  HOST_KEY,
  PORT_KEY,
  USERNAME_KEY,
  PASSWORD_KEY,
} from '../constants';
import styles from './emailFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  hostLabel: {
    id: 'EmailFormFields.hostLabel',
    defaultMessage: 'Host',
  },
  protocolLabel: {
    id: 'EmailFormFields.protocolLabel',
    defaultMessage: 'Protocol',
  },
  fromLabel: {
    id: 'EmailFormFields.fromLabel',
    defaultMessage: 'Default sender name',
  },
  portLabel: {
    id: 'EmailFormFields.portLabel',
    defaultMessage: 'Port',
  },
  authLabel: {
    id: 'EmailFormFields.authLabel',
    defaultMessage: 'Authorization',
  },
  usernameLabel: {
    id: 'EmailFormFields.usernameLabel',
    defaultMessage: 'Username',
  },
  passwordLabel: {
    id: 'EmailFormFields.passwordLabel',
    defaultMessage: 'Password',
  },
});

const portValidator = composeBoundValidators([
  commonValidators.requiredField,
  bindMessageToValidator(validate.port, 'portFieldHint'),
]);

@connect((state) => ({
  authEnabled: formValueSelector(INTEGRATION_FORM)(state, AUTH_ENABLED_KEY),
}))
@injectIntl
export class EmailFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    authEnabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
  };

  static defaultProps = {
    disabled: false,
    authEnabled: false,
    lineAlign: false,
    initialData: DEFAULT_FORM_CONFIG,
  };

  constructor(props) {
    super(props);
    this.protocolOptions = [{ value: 'smtp', label: 'SMTP' }];
    this.authOptions = [
      { value: true, label: 'ON' },
      { value: false, label: 'OFF' },
    ];
  }

  componentDidMount() {
    this.props.initialize(this.props.initialData);
  }

  onChangeAuthAvailability = (event, value) => {
    if (!value) {
      this.props.change(USERNAME_KEY, '');
      this.props.change(PASSWORD_KEY, '');
    }
  };

  formatPortValue = (value) => value && String(value);
  normalizeValue = (value) => `${value}`.replace(/\D+/g, '');

  render() {
    const {
      intl: { formatMessage },
      authEnabled,
      disabled,
      lineAlign,
    } = this.props;

    return (
      <Fragment>
        <IntegrationFormField
          name={HOST_KEY}
          required
          disabled={disabled}
          label={formatMessage(messages.hostLabel)}
          validate={commonValidators.requiredField}
          lineAlign={lineAlign}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name={PROTOCOL_KEY}
          disabled={disabled}
          label={formatMessage(messages.protocolLabel)}
          lineAlign={lineAlign}
        >
          <InputDropdown options={this.protocolOptions} mobileDisabled />
        </IntegrationFormField>
        <IntegrationFormField
          name={FROM_KEY}
          disabled={disabled}
          label={formatMessage(messages.fromLabel)}
          lineAlign={lineAlign}
        >
          <Input mobileDisabled />
        </IntegrationFormField>
        <IntegrationFormField
          name={PORT_KEY}
          required
          disabled={disabled}
          label={formatMessage(messages.portLabel)}
          format={this.formatPortValue}
          normalize={this.normalizeValue}
          lineAlign={lineAlign}
          validate={portValidator}
        >
          <FieldErrorHint>
            <Input maxLength="5" mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name={AUTH_ENABLED_KEY}
          disabled={disabled}
          label={formatMessage(messages.authLabel)}
          format={Boolean}
          lineAlign={lineAlign}
          onChange={this.onChangeAuthAvailability}
        >
          <InputDropdown options={this.authOptions} mobileDisabled />
        </IntegrationFormField>
        {authEnabled && (
          <Fragment>
            <IntegrationFormField
              name={USERNAME_KEY}
              disabled={disabled}
              label={formatMessage(messages.usernameLabel)}
              lineAlign={lineAlign}
            >
              <Input mobileDisabled />
            </IntegrationFormField>
            <IntegrationFormField
              name={PASSWORD_KEY}
              disabled={disabled}
              label={formatMessage(messages.passwordLabel)}
              lineAlign={lineAlign}
            >
              <Input type="password" mobileDisabled />
            </IntegrationFormField>
          </Fragment>
        )}
        <div className={cx('checkboxes-container', { 'line-align': lineAlign })}>
          <div className={cx('checkbox-wrapper')}>
            <FieldProvider name={TLS_KEY} disabled={disabled} format={Boolean}>
              <InputCheckbox>TLS</InputCheckbox>
            </FieldProvider>
          </div>
          <div className={cx('checkbox-wrapper')}>
            <FieldProvider name={SSL_KEY} disabled={disabled} format={Boolean}>
              <InputCheckbox>SSL</InputCheckbox>
            </FieldProvider>
          </div>
        </div>
      </Fragment>
    );
  }
}
