import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { formValueSelector } from 'redux-form';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { FormField } from 'components/fields/formField';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import {
  EMAIL_SERVER_FORM,
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
import styles from './emailServerTabFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  hostLabel: {
    id: 'EmailServerTabFormFields.hostLabel',
    defaultMessage: 'Host',
  },
  protocolLabel: {
    id: 'EmailServerTabFormFields.protocolLabel',
    defaultMessage: 'Protocol',
  },
  fromLabel: {
    id: 'EmailServerTabFormFields.fromLabel',
    defaultMessage: 'Default sender name',
  },
  portLabel: {
    id: 'EmailServerTabFormFields.portLabel',
    defaultMessage: 'Port',
  },
  authLabel: {
    id: 'EmailServerTabFormFields.authLabel',
    defaultMessage: 'Authorization',
  },
  usernameLabel: {
    id: 'EmailServerTabFormFields.usernameLabel',
    defaultMessage: 'Username',
  },
  passwordLabel: {
    id: 'EmailServerTabFormFields.passwordLabel',
    defaultMessage: 'Password',
  },
});

@connect((state) => ({
  projectId: activeProjectSelector(state),
  authEnabled: formValueSelector(EMAIL_SERVER_FORM)(state, AUTH_ENABLED_KEY),
}))
@injectIntl
export class EmailServerTabFormFields extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    authEnabled: PropTypes.bool,
    changeFieldValue: PropTypes.func,
  };

  static defaultProps = {
    authEnabled: false,
    changeFieldValue: () => {},
  };

  constructor(props) {
    super(props);
    this.protocolOptions = [{ value: 'smtp', label: 'SMTP' }];
    this.authOptions = [{ value: true, label: 'ON' }, { value: false, label: 'OFF' }];
  }

  onChangeAuthAvailability = (event, value) => {
    if (!value) {
      this.props.changeFieldValue(USERNAME_KEY, '');
      this.props.changeFieldValue(PASSWORD_KEY, '');
    }
  };

  render() {
    const {
      intl: { formatMessage },
      authEnabled,
    } = this.props;

    return (
      <div className={cx('email-server-tab-form-fields')}>
        <FormField
          name={HOST_KEY}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.hostLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={PROTOCOL_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.protocolLabel)}
          labelClassName={cx('label')}
        >
          <InputDropdown options={this.protocolOptions} mobileDisabled />
        </FormField>
        <FormField
          name={FROM_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.fromLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={PORT_KEY}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.portLabel)}
          format={String}
          parse={(value) => value && Number(value)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input type="number" maxLength="5" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={AUTH_ENABLED_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.authLabel)}
          format={Boolean}
          onChange={this.onChangeAuthAvailability}
          labelClassName={cx('label')}
        >
          <InputDropdown options={this.authOptions} mobileDisabled />
        </FormField>
        {authEnabled && (
          <Fragment>
            <FormField
              name={USERNAME_KEY}
              fieldWrapperClassName={cx('form-field-wrapper')}
              label={formatMessage(messages.usernameLabel)}
              labelClassName={cx('label')}
            >
              <FieldErrorHint>
                <Input mobileDisabled />
              </FieldErrorHint>
            </FormField>
            <FormField
              name={PASSWORD_KEY}
              fieldWrapperClassName={cx('form-field-wrapper')}
              label={formatMessage(messages.passwordLabel)}
              labelClassName={cx('label')}
            >
              <FieldErrorHint>
                <Input type="password" mobileDisabled />
              </FieldErrorHint>
            </FormField>
          </Fragment>
        )}
        <div className={cx('checkboxes-container')}>
          <div className={cx('checkbox-wrapper')}>
            <FieldProvider name={TLS_KEY} format={Boolean}>
              <InputCheckbox>TLS</InputCheckbox>
            </FieldProvider>
          </div>
          <div className={cx('checkbox-wrapper')}>
            <FieldProvider name={SSL_KEY} format={Boolean}>
              <InputCheckbox>SSL</InputCheckbox>
            </FieldProvider>
          </div>
        </div>
      </div>
    );
  }
}
