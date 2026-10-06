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

import { Component, Fragment } from 'react';
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
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Dropdown, FieldText, Radio } from '@reportportal/ui-kit';
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { INTEGRATION_FORM } from 'components/integrations/elements';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
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
  ENCRYPTION_MODE_NONE,
  ENCRYPTION_MODE_TLS,
  ENCRYPTION_MODE_SSL,
  PROTOCOL_SMTP,
} from '../constants';
import styles from './emailFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  hostLabel: {
    id: 'EmailFormFields.hostLabel',
    defaultMessage: 'Host',
  },
  hostPlaceholder: {
    id: 'EmailFormFields.hostPlaceholder',
    defaultMessage: 'Enter your SMTP server address',
  },
  protocolLabel: {
    id: 'EmailFormFields.protocolLabel',
    defaultMessage: 'Protocol',
  },
  protocolPlaceholder: {
    id: 'EmailFormFields.protocolPlaceholder',
    defaultMessage: 'Select protocol',
  },
  fromNameLabel: {
    id: 'EmailFormFields.fromNameLabel',
    defaultMessage: 'From name',
  },
  fromNamePlaceholder: {
    id: 'EmailFormFields.fromNamePlaceholder',
    defaultMessage: 'Name recipients will see',
  },
  fromEmailLabel: {
    id: 'EmailFormFields.fromEmailLabel',
    defaultMessage: 'From email',
  },
  fromEmailPlaceholder: {
    id: 'EmailFormFields.fromEmailPlaceholder',
    defaultMessage: 'Email address to send from',
  },
  portLabel: {
    id: 'EmailFormFields.portLabel',
    defaultMessage: 'Port',
  },
  portPlaceholder: {
    id: 'EmailFormFields.portPlaceholder',
    defaultMessage: 'Enter port number',
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
  usernamePlaceholder: {
    id: 'EmailFormFields.usernamePlaceholder',
    defaultMessage: 'Your email or login',
  },
  passwordLabel: {
    id: 'EmailFormFields.passwordLabel',
    defaultMessage: 'Password',
  },
  passwordPlaceholder: {
    id: 'EmailFormFields.passwordPlaceholder',
    defaultMessage: 'Enter app password',
  },
  encryptionLabel: {
    id: 'EmailFormFields.encryptionLabel',
    defaultMessage: 'Encryption',
  },
  encryptionNone: {
    id: 'EmailFormFields.encryptionNone',
    defaultMessage: 'None',
  },
  encryptionTls: {
    id: 'EmailFormFields.encryptionTls',
    defaultMessage: 'TLS',
  },
  encryptionSsl: {
    id: 'EmailFormFields.encryptionSsl',
    defaultMessage: 'SSL',
  },
});

const portValidator = composeBoundValidators([
  commonValidators.requiredField,
  bindMessageToValidator(validate.port, 'portFieldHint'),
]);

const getEncryptionMode = (tlsEnabled, sslEnabled) => {
  if (tlsEnabled && sslEnabled) return ENCRYPTION_MODE_TLS;
  if (sslEnabled) return ENCRYPTION_MODE_SSL;
  if (tlsEnabled) return ENCRYPTION_MODE_TLS;
  return ENCRYPTION_MODE_NONE;
};

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
  tlsEnabled: formValueSelector(INTEGRATION_FORM)(state, TLS_KEY),
  sslEnabled: formValueSelector(INTEGRATION_FORM)(state, SSL_KEY),
  authMode: formValueSelector(INTEGRATION_FORM)(state, AUTH_MODE_KEY),
}))
@injectIntl
export class EmailFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    tlsEnabled: PropTypes.bool,
    sslEnabled: PropTypes.bool,
    authMode: PropTypes.string,
    initialData: PropTypes.object,
    editAuthMode: PropTypes.bool,
    updateMetaData: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    tlsEnabled: false,
    sslEnabled: false,
    authMode: AUTH_MODE_OFF,
    initialData: DEFAULT_FORM_CONFIG,
    editAuthMode: false,
    updateMetaData: () => {},
  };

  constructor(props) {
    super(props);
    this.protocolOptions = [{ value: PROTOCOL_SMTP, label: 'SMTP' }];
    this.authOptions = [
      { value: AUTH_MODE_OFF, label: 'Off' },
      { value: AUTH_MODE_BASIC, label: 'Basic' },
      { value: AUTH_MODE_OAUTH2, label: 'OAuth 2.0' },
    ];
  }

  componentDidMount() {
    const { initialData, editAuthMode, updateMetaData } = this.props;
    const preparedData = separateFromIntoNameAndEmail(initialData);
    if (editAuthMode) {
      preparedData[PASSWORD_KEY] = '';
    }
    preparedData[AUTH_MODE_KEY] = resolveAuthMode(preparedData);
    this.props.initialize(preparedData);
    if (preparedData[TLS_KEY] && preparedData[SSL_KEY]) {
      this.props.change(SSL_KEY, false);
    }
    updateMetaData({
      [SECRET_FIELDS_KEY]: [PASSWORD_KEY],
    });
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

  onEncryptionChange = (mode) => {
    const { change } = this.props;
    switch (mode) {
      case ENCRYPTION_MODE_NONE:
        change(TLS_KEY, false);
        change(SSL_KEY, false);
        break;
      case ENCRYPTION_MODE_TLS:
        change(TLS_KEY, true);
        change(SSL_KEY, false);
        break;
      case ENCRYPTION_MODE_SSL:
        change(TLS_KEY, false);
        change(SSL_KEY, true);
        break;
      default:
        break;
    }
  };

  formatPortValue = (value) => value && String(value);
  normalizeValue = (value) => `${value}`.replace(/\D+/g, '');

  render() {
    const {
      intl: { formatMessage },
      tlsEnabled,
      sslEnabled,
      authMode,
      disabled,
    } = this.props;

    const encryptionMode = getEncryptionMode(tlsEnabled, sslEnabled);
    const encryptionOptions = [
      {
        mode: ENCRYPTION_MODE_NONE,
        label: formatMessage(messages.encryptionNone),
      },
      {
        mode: ENCRYPTION_MODE_TLS,
        label: formatMessage(messages.encryptionTls),
      },
      {
        mode: ENCRYPTION_MODE_SSL,
        label: formatMessage(messages.encryptionSsl),
      },
    ];

    return (
      <Fragment>
        <FieldElement
          name={HOST_KEY}
          label={formatMessage(messages.hostLabel)}
          validate={commonValidators.requiredField}
          disabled={disabled}
          className={cx('fields')}
          isRequired
          placeholder={formatMessage(messages.hostPlaceholder)}
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
            <Dropdown
              options={this.protocolOptions}
              placeholder={formatMessage(messages.protocolPlaceholder)}
            />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={FROM_NAME_KEY}
          label={formatMessage(messages.fromNameLabel)}
          disabled={disabled}
          className={cx('fields')}
          placeholder={formatMessage(messages.fromNamePlaceholder)}
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
          placeholder={formatMessage(messages.fromEmailPlaceholder)}
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
          placeholder={formatMessage(messages.portPlaceholder)}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={AUTH_MODE_KEY}
          label={formatMessage(messages.authLabel)}
          disabled={disabled}
          className={cx('fields')}
          onChange={this.onChangeAuthMode}
        >
          <FieldErrorHint provideHint={false}>
            <Dropdown options={this.authOptions} />
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
              placeholder={formatMessage(messages.usernamePlaceholder)}
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
              validate={commonValidators.requiredField}
              isRequired
              placeholder={formatMessage(messages.passwordPlaceholder)}
            >
              <FieldErrorHint provideHint={false}>
                <FieldText defaultWidth={false} type="password" />
              </FieldErrorHint>
            </FieldElement>
          </>
        )}
        <div className={cx('fields', 'encryption-block')}>
          <span className={cx('encryption-label')}>{formatMessage(messages.encryptionLabel)}</span>
          <div className={cx('radio-row')}>
            {encryptionOptions.map(({ mode, label }) => (
              <Radio
                key={mode}
                disabled={disabled}
                option={{
                  value: mode,
                  label,
                  disabled: !!disabled,
                }}
                value={encryptionMode}
                onChange={() => this.onEncryptionChange(mode)}
              />
            ))}
          </div>
        </div>
      </Fragment>
    );
  }
}
