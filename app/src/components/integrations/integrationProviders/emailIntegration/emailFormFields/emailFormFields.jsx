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
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Checkbox, Dropdown, FieldText } from '@reportportal/ui-kit';
import { INTEGRATION_FORM } from 'components/integrations/elements';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { separateFromIntoNameAndEmail } from 'common/utils';
import {
  DEFAULT_FORM_CONFIG,
  AUTH_ENABLED_KEY,
  PROTOCOL_KEY,
  SSL_KEY,
  TLS_KEY,
  FROM_NAME_KEY,
  HOST_KEY,
  PORT_KEY,
  USERNAME_KEY,
  PASSWORD_KEY,
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
    initialData: PropTypes.object,
  };

  static defaultProps = {
    disabled: false,
    authEnabled: false,
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
    const { initialData } = this.props;
    const preparedData = separateFromIntoNameAndEmail(initialData);
    this.props.initialize(preparedData);
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
            <Dropdown options={this.protocolOptions} />
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
          name={AUTH_ENABLED_KEY}
          label={formatMessage(messages.authLabel)}
          disabled={disabled}
          format={Boolean}
          onChange={this.onChangeAuthAvailability}
        >
          <FieldErrorHint provideHint={false}>
            <Dropdown options={this.authOptions} />
          </FieldErrorHint>
        </FieldElement>
        {authEnabled && (
          <>
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
