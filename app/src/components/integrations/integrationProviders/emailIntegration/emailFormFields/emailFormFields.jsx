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
import { Checkbox } from '@reportportal/ui-kit';
import { INTEGRATION_FORM } from 'components/integrations/elements';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { FieldText } from 'componentLibrary/fieldText';
import { Dropdown } from 'componentLibrary/dropdown';
import { separateFromIntoNameAndEmail } from 'common/utils';
import {
  DEFAULT_FORM_CONFIG,
  AUTH_ENABLED_KEY,
  AUTH_MODE_KEY,
  AUTH_MODE_OFF,
  AUTH_MODE_BASIC,
  AUTH_MODE_OAUTH2,
  PROTOCOL_KEY,
  SSL_KEY,
  TLS_KEY,
  FROM_NAME_KEY,
  HOST_KEY,
  PORT_KEY,
  USERNAME_KEY,
  PASSWORD_KEY,
  TENANT_ID_KEY,
  CLIENT_ID_KEY,
  CLIENT_SECRET_KEY,
  FROM_EMAIL_KEY,
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
  fromNameLabel: {
    id: 'EmailFormFields.fromNameLabel',
    defaultMessage: 'From name',
  },
  fromEmailLabel: {
    id: 'EmailFormFields.fromEmailLabel',
    defaultMessage: 'From Email',
  },
  portLabel: {
    id: 'EmailFormFields.portLabel',
    defaultMessage: 'Port',
  },
  authLabel: {
    id: 'EmailFormFields.authLabel',
    defaultMessage: 'Authorization',
  },
  tenantIdLabel: {
    id: 'EmailFormFields.tenantIdLabel',
    defaultMessage: 'Tenant Id',
  },
  clientIdLabel: {
    id: 'EmailFormFields.clientIdLabel',
    defaultMessage: 'Client Id',
  },
  clientSecretLabel: {
    id: 'EmailFormFields.clientSecretLabel',
    defaultMessage: 'Client Secret',
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

/*
 * Integrations persisted before AUTH_MODE_KEY existed only carry the legacy boolean
 * authEnabled flag: true meant Basic auth (the only mode that existed back then), anything
 * else meant Off. Mirrors EmailAuthMode#resolve on the backend.
 */
const resolveAuthMode = (data) => {
  if (data[AUTH_MODE_KEY]) {
    return data[AUTH_MODE_KEY];
  }
  return data[AUTH_ENABLED_KEY] === true || data[AUTH_ENABLED_KEY] === 'true'
    ? AUTH_MODE_BASIC
    : AUTH_MODE_OFF;
};

@connect((state) => ({
  authMode: formValueSelector(INTEGRATION_FORM)(state, AUTH_MODE_KEY),
}))
@injectIntl
export class EmailFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    authMode: PropTypes.string,
    initialData: PropTypes.object,
  };

  static defaultProps = {
    disabled: false,
    authMode: AUTH_MODE_OFF,
    initialData: DEFAULT_FORM_CONFIG,
  };

  constructor(props) {
    super(props);
    this.protocolOptions = [{ value: 'smtp', label: 'SMTP' }];
    this.authOptions = [
      { value: AUTH_MODE_OFF, label: 'Off' },
      { value: AUTH_MODE_BASIC, label: 'Basic' },
      { value: AUTH_MODE_OAUTH2, label: 'OAuth 2.0' },
    ];
  }

  componentDidMount() {
    const { initialData } = this.props;
    const preparedData = separateFromIntoNameAndEmail(initialData);
    preparedData[AUTH_MODE_KEY] = resolveAuthMode(preparedData);
    this.props.initialize(preparedData);
  }

  onChangeAuthMode = (event, value) => {
    if (value === AUTH_MODE_OFF) {
      this.props.change(USERNAME_KEY, '');
    }
    if (value !== AUTH_MODE_BASIC) {
      this.props.change(PASSWORD_KEY, '');
    }
    if (value !== AUTH_MODE_OAUTH2) {
      this.props.change(TENANT_ID_KEY, '');
      this.props.change(CLIENT_ID_KEY, '');
      this.props.change(CLIENT_SECRET_KEY, '');
    }
  };

  formatPortValue = (value) => value && String(value);
  normalizeValue = (value) => `${value}`.replace(/\D+/g, '');

  render() {
    const {
      intl: { formatMessage },
      authMode,
      disabled,
    } = this.props;

    return (
      <Fragment>
        <FieldElement
          name={HOST_KEY}
          label={formatMessage(messages.hostLabel)}
          validate={commonValidators.requiredField}
          disabled={disabled}
          className={cx('fields')}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
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
          name={FROM_NAME_KEY}
          label={formatMessage(messages.fromNameLabel)}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={FROM_EMAIL_KEY}
          label={formatMessage(messages.fromEmailLabel)}
          disabled={disabled}
          className={cx('fields')}
          validate={commonValidators.email}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
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
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={AUTH_MODE_KEY}
          label={formatMessage(messages.authLabel)}
          disabled={disabled}
          onChange={this.onChangeAuthMode}
        >
          <FieldErrorHint provideHint={false}>
            <Dropdown options={this.authOptions} defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        {(authMode === AUTH_MODE_BASIC || authMode === AUTH_MODE_OAUTH2) && (
          <FieldElement
            name={USERNAME_KEY}
            label={formatMessage(messages.usernameLabel)}
            disabled={disabled}
            className={cx('fields')}
            validate={commonValidators.requiredField}
            isRequired
          >
            <FieldErrorHint provideHint={false}>
              <FieldText defaultWidth={false} />
            </FieldErrorHint>
          </FieldElement>
        )}
        {authMode === AUTH_MODE_BASIC && (
          <FieldElement
            name={PASSWORD_KEY}
            label={formatMessage(messages.passwordLabel)}
            disabled={disabled}
            className={cx('fields')}
            isRequired
          >
            <FieldErrorHint provideHint={false}>
              <FieldText defaultWidth={false} type="password" />
            </FieldErrorHint>
          </FieldElement>
        )}
        {authMode === AUTH_MODE_OAUTH2 && (
          <>
            <FieldElement
              name={TENANT_ID_KEY}
              label={formatMessage(messages.tenantIdLabel)}
              disabled={disabled}
              className={cx('fields')}
              validate={commonValidators.requiredField}
              isRequired
            >
              <FieldErrorHint provideHint={false}>
                <FieldText defaultWidth={false} />
              </FieldErrorHint>
            </FieldElement>
            <FieldElement
              name={CLIENT_ID_KEY}
              label={formatMessage(messages.clientIdLabel)}
              disabled={disabled}
              className={cx('fields')}
              validate={commonValidators.requiredField}
              isRequired
            >
              <FieldErrorHint provideHint={false}>
                <FieldText defaultWidth={false} />
              </FieldErrorHint>
            </FieldElement>
            <FieldElement
              name={CLIENT_SECRET_KEY}
              label={formatMessage(messages.clientSecretLabel)}
              disabled={disabled}
              className={cx('fields')}
              isRequired
            >
              <FieldErrorHint provideHint={false}>
                <FieldText defaultWidth={false} type="password" />
              </FieldErrorHint>
            </FieldElement>
          </>
        )}
        <div className={cx('checkboxes-container')}>
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
