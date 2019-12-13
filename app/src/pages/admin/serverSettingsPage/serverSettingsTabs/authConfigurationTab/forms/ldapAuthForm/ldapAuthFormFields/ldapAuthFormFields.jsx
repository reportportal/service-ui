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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { formValueSelector } from 'redux-form';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { InputConditional } from 'components/inputs/inputConditional';
import { InputDropdown } from 'components/inputs/inputDropdown';
import {
  LDAP_ATTRIBUTES_KEY,
  LDAP_PREFIX,
  LDAPS_PREFIX,
  URL_KEY,
  BASE_DN_KEY,
  PHOTO_KEY,
  FULL_NAME_KEY,
  EMAIL_KEY,
} from 'pages/admin/serverSettingsPage/common/constants';
import {
  LDAP_AUTH_FORM,
  MANAGER_DN_KEY,
  GROUP_SEARCH_BASE_KEY,
  GROUP_SEARCH_FILTER_KEY,
  USER_SEARCH_FILTER_KEY,
  USER_DN_PATTERN_KEY,
  PASSWORD_ATTRIBUTE_KEY,
  PASSWORD_ENCODER_TYPE_KEY,
  MANAGER_PASSWORD_KEY,
} from '../constants';
import styles from './ldapAuthFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  urlLabel: {
    id: 'LdapAuthFormFields.urlLabel',
    defaultMessage: 'Url',
  },
  baseDnLabel: {
    id: 'LdapAuthFormFields.baseDnLabel',
    defaultMessage: 'Base DN',
  },
  managerDnLabel: {
    id: 'LdapAuthFormFields.managerDnLabel',
    defaultMessage: 'Manager DN',
  },
  managerPasswordLabel: {
    id: 'LdapAuthFormFields.managerPasswordLabel',
    defaultMessage: 'Manager password',
  },
  userDnPatternLabel: {
    id: 'LdapAuthFormFields.userDnPatternLabel',
    defaultMessage: 'User DN pattern',
  },
  userSearchFilterLabel: {
    id: 'LdapAuthFormFields.userSearchFilterLabel',
    defaultMessage: 'User search filter',
  },
  groupSearchBaseLabel: {
    id: 'LdapAuthFormFields.groupSearchBaseLabel',
    defaultMessage: 'Group search base',
  },
  groupSearchFilterLabel: {
    id: 'LdapAuthFormFields.groupSearchFilterLabel',
    defaultMessage: 'Group search filter',
  },
  passwordEncoderTypeLabel: {
    id: 'LdapAuthFormFields.passwordEncoderTypeLabel',
    defaultMessage: 'Password encoder type',
  },
  passwordAttributeLabel: {
    id: 'LdapAuthFormFields.passwordAttributeLabel',
    defaultMessage: 'Password attribute',
  },
  emailAttributeLabel: {
    id: 'LdapAuthFormFields.emailAttributeLabel',
    defaultMessage: 'Email attribute',
  },
  fullNameAttributeLabel: {
    id: 'LdapAuthFormFields.fullNameAttributeLabel',
    defaultMessage: 'Full name attribute',
  },
  photoAttributeLabel: {
    id: 'LdapAuthFormFields.photoAttributeLabel',
    defaultMessage: 'Photo attribute',
  },
});

@connect((state) => ({
  passwordEncoderType: formValueSelector(LDAP_AUTH_FORM)(state, PASSWORD_ENCODER_TYPE_KEY),
}))
@injectIntl
export class LdapAuthFormFields extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    passwordEncoderType: PropTypes.string,
  };

  static defaultProps = {
    passwordEncoderType: '',
  };

  constructor(props) {
    super(props);
    this.urlConditions = [
      {
        value: LDAPS_PREFIX,
        label: LDAPS_PREFIX,
        shortLabel: LDAPS_PREFIX,
      },
      {
        value: LDAP_PREFIX,
        label: LDAP_PREFIX,
        shortLabel: LDAP_PREFIX,
      },
    ];
    this.passwordEncoderOptions = [
      { value: '', label: 'NO' },
      { value: 'PLAIN', label: 'PLAIN' },
      { value: 'SHA', label: 'SHA' },
      { value: 'LDAP_SHA', label: 'LDAP_SHA' },
      { value: 'MD4', label: 'MD4' },
      { value: 'MD5', label: 'MD5' },
    ];
  }

  formatConditionalValue = (fullValue) => {
    let formattedValue = {
      value: '',
      condition: this.urlConditions[0],
    };
    if (fullValue) {
      const [condition, value] = fullValue.split('//');
      formattedValue = {
        value,
        condition: `${condition}//`,
      };
    }
    return formattedValue;
  };

  parseConditionalValue = (value) => value && `${value.condition}${value.value}`;

  render() {
    const {
      intl: { formatMessage },
      passwordEncoderType,
    } = this.props;

    return (
      <div className={cx('ldap-auth-form-fields')}>
        <FormField
          name={`${LDAP_ATTRIBUTES_KEY}.${URL_KEY}`}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.urlLabel)}
          labelClassName={cx('label')}
          format={this.formatConditionalValue}
          parse={this.parseConditionalValue}
        >
          <FieldErrorHint>
            <InputConditional
              isCustomConditions
              conditions={this.urlConditions}
              inputClassName={cx('conditional-input')}
              conditionsBlockClassName={cx('conditions-block')}
              mobileDisabled
            />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={`${LDAP_ATTRIBUTES_KEY}.${BASE_DN_KEY}`}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.baseDnLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={MANAGER_DN_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.managerDnLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={MANAGER_PASSWORD_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.managerPasswordLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={USER_DN_PATTERN_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.userDnPatternLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={USER_SEARCH_FILTER_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.userSearchFilterLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={GROUP_SEARCH_BASE_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.groupSearchBaseLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={GROUP_SEARCH_FILTER_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.groupSearchFilterLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={PASSWORD_ENCODER_TYPE_KEY}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.passwordEncoderTypeLabel)}
          format={String}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <InputDropdown options={this.passwordEncoderOptions} mobileDisabled />
          </FieldErrorHint>
        </FormField>
        {passwordEncoderType && (
          <FormField
            name={PASSWORD_ATTRIBUTE_KEY}
            fieldWrapperClassName={cx('form-field-wrapper')}
            label={formatMessage(messages.passwordAttributeLabel)}
            labelClassName={cx('label')}
          >
            <FieldErrorHint>
              <Input maxLength="128" mobileDisabled />
            </FieldErrorHint>
          </FormField>
        )}
        <FormField
          name={`${LDAP_ATTRIBUTES_KEY}.${EMAIL_KEY}`}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.emailAttributeLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={`${LDAP_ATTRIBUTES_KEY}.${FULL_NAME_KEY}`}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.fullNameAttributeLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={`${LDAP_ATTRIBUTES_KEY}.${PHOTO_KEY}`}
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.photoAttributeLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input maxLength="128" mobileDisabled />
          </FieldErrorHint>
        </FormField>
      </div>
    );
  }
}
