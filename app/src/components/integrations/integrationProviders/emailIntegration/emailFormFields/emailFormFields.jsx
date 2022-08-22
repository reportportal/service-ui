/*
 * Copyright 2022 EPAM Systems
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
import { Checkbox } from 'componentLibrary/checkbox';
import { INTEGRATION_FORM } from 'components/integrations/elements';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { FieldText } from 'componentLibrary/fieldText';
import { Dropdown } from 'componentLibrary/dropdown';
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
    defaultMessage: 'Sender email',
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
        <FieldElement
          name={HOST_KEY}
          label={formatMessage(messages.hostLabel)}
          validate={commonValidators.requiredField}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText
              defaultWidth={false}
              isRequired
              placeholder={formatMessage(messages.hostLabel)}
            />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={PROTOCOL_KEY}
          label={formatMessage(messages.protocolLabel)}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <Dropdown options={this.protocolOptions} defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={FROM_KEY}
          label={formatMessage(messages.fromLabel)}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} placeholder={formatMessage(messages.fromLabel)} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={PORT_KEY}
          label={formatMessage(messages.portLabel)}
          validate={portValidator}
          disabled={disabled}
          format={this.formatPortValue}
          normalize={this.normalizeValue}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText
              defaultWidth={false}
              isRequired
              maxLength={5}
              placeholder={formatMessage(messages.portLabel)}
            />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={USERNAME_KEY}
          label={formatMessage(messages.usernameLabel)}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} placeholder={formatMessage(messages.usernameLabel)} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={AUTH_ENABLED_KEY}
          label={formatMessage(messages.authLabel)}
          disabled={disabled}
          format={Boolean}
          onChange={this.onChangeAuthAvailability}
        >
          <FieldErrorHint provideHint={false}>
            <Dropdown options={this.authOptions} defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        {authEnabled && (
          <FieldElement
            name={PASSWORD_KEY}
            label={formatMessage(messages.passwordLabel)}
            disabled={disabled}
            className={cx('fields')}
          >
            <FieldErrorHint provideHint={false}>
              <FieldText
                defaultWidth={false}
                type="password"
                placeholder={formatMessage(messages.passwordLabel)}
              />
            </FieldErrorHint>
          </FieldElement>
        )}
        <div className={cx('checkboxes-container', { 'line-align': lineAlign })}>
          <div className={cx('checkbox-wrapper')}>
            <FieldProvider name={TLS_KEY} disabled={disabled} format={Boolean}>
              <Checkbox>TLS</Checkbox>
            </FieldProvider>
          </div>
          <div className={cx('checkbox-wrapper')}>
            <FieldProvider name={SSL_KEY} disabled={disabled} format={Boolean}>
              <Checkbox>SSL</Checkbox>
            </FieldProvider>
          </div>
        </div>
      </Fragment>
    );
  }
}
