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
import { injectIntl, defineMessages } from 'react-intl';
import { formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { isEmptyObject } from 'common/utils/isEmptyObject';
import { validate, commonValidators, bindMessageToValidator } from 'common/utils/validation';
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputConditional } from 'components/inputs/inputConditional';
import { IntegrationFormField, INTEGRATION_FORM } from 'components/integrations/elements';
import {
  DEFAULT_FORM_CONFIG,
  MANAGER_DN_KEY,
  GROUP_SEARCH_BASE_KEY,
  GROUP_SEARCH_FILTER_KEY,
  USER_SEARCH_FILTER_KEY,
  USER_DN_PATTERN_KEY,
  PASSWORD_ATTRIBUTE_KEY,
  PASSWORD_ENCODER_TYPE_KEY,
  MANAGER_PASSWORD_KEY,
  LDAP_PREFIX,
  LDAPS_PREFIX,
  URL_KEY,
  BASE_DN_KEY,
  PHOTO_KEY,
  FULL_NAME_KEY,
  EMAIL_KEY,
} from '../constants';
import styles from './ldapFormFields.scss';

const cx = classNames.bind(styles);
const integrationFormValueSelector = formValueSelector(INTEGRATION_FORM);

const messages = defineMessages({
  urlLabel: {
    id: 'LdapFormFields.urlLabel',
    defaultMessage: 'Url',
  },
  baseDnLabel: {
    id: 'LdapFormFields.baseDnLabel',
    defaultMessage: 'Base DN',
  },
  managerDnLabel: {
    id: 'LdapFormFields.managerDnLabel',
    defaultMessage: 'Manager DN',
  },
  managerPasswordLabel: {
    id: 'LdapFormFields.managerPasswordLabel',
    defaultMessage: 'Manager password',
  },
  userDnPatternLabel: {
    id: 'LdapFormFields.userDnPatternLabel',
    defaultMessage: 'User DN pattern',
  },
  userSearchFilterLabel: {
    id: 'LdapFormFields.userSearchFilterLabel',
    defaultMessage: 'User search filter',
  },
  groupSearchBaseLabel: {
    id: 'LdapFormFields.groupSearchBaseLabel',
    defaultMessage: 'Group search base',
  },
  groupSearchFilterLabel: {
    id: 'LdapFormFields.groupSearchFilterLabel',
    defaultMessage: 'Group search filter',
  },
  passwordEncoderTypeLabel: {
    id: 'LdapFormFields.passwordEncoderTypeLabel',
    defaultMessage: 'Password encoder type',
  },
  passwordAttributeLabel: {
    id: 'LdapFormFields.passwordAttributeLabel',
    defaultMessage: 'Password attribute',
  },
  emailAttributeLabel: {
    id: 'LdapFormFields.emailAttributeLabel',
    defaultMessage: 'Email attribute',
  },
  fullNameAttributeLabel: {
    id: 'LdapFormFields.fullNameAttributeLabel',
    defaultMessage: 'Full name attribute',
  },
  photoAttributeLabel: {
    id: 'LdapFormFields.photoAttributeLabel',
    defaultMessage: 'Photo attribute',
  },
});

const urlValidator = bindMessageToValidator(validate.ldapUrl, 'requiredFieldHint');

@connect((state) => ({
  passwordEncoderType: integrationFormValueSelector(state, PASSWORD_ENCODER_TYPE_KEY),
}))
@injectIntl
export class LdapFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
    passwordEncoderType: PropTypes.string,
    updateMetaData: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    lineAlign: false,
    initialData: DEFAULT_FORM_CONFIG,
    passwordEncoderType: '',
    updateMetaData: () => {},
  };

  componentDidMount() {
    const { initialData, initialize } = this.props;
    const data = isEmptyObject(initialData)
      ? DEFAULT_FORM_CONFIG
      : { [PASSWORD_ENCODER_TYPE_KEY]: '', ...initialData };

    initialize(data);
    this.props.updateMetaData({
      [SECRET_FIELDS_KEY]: [MANAGER_PASSWORD_KEY, PASSWORD_ATTRIBUTE_KEY],
    });
  }

  onChangePasswordEncoderType = (event, value) => {
    if (!value) {
      this.props.change(PASSWORD_ATTRIBUTE_KEY, '');
    }
  };

  getFieldsConfig = () => {
    const { passwordEncoderType } = this.props;
    const defaultField = <Input maxLength="128" mobileDisabled />;

    const fields = [
      {
        fieldProps: {
          name: URL_KEY,
          validate: urlValidator,
          format: this.formatConditionalValue,
          parse: this.parseConditionalValue,
          required: true,
        },
        label: messages.urlLabel,
        children: (
          <FieldErrorHint>
            <InputConditional
              isCustomConditions
              conditions={this.urlConditions}
              inputClassName={cx('conditional-input')}
              conditionsBlockClassName={cx('conditions-block')}
              mobileDisabled
            />
          </FieldErrorHint>
        ),
      },
      {
        fieldProps: {
          name: BASE_DN_KEY,
          validate: commonValidators.requiredField,
          required: true,
        },
        label: messages.baseDnLabel,
        children: <FieldErrorHint>{defaultField}</FieldErrorHint>,
      },
      {
        fieldProps: {
          name: MANAGER_DN_KEY,
        },
        label: messages.managerDnLabel,
        children: defaultField,
      },
      {
        fieldProps: {
          name: MANAGER_PASSWORD_KEY,
        },
        label: messages.managerPasswordLabel,
        children: defaultField,
      },
      {
        fieldProps: {
          name: USER_DN_PATTERN_KEY,
        },
        label: messages.userDnPatternLabel,
        children: defaultField,
      },
      {
        fieldProps: {
          name: USER_SEARCH_FILTER_KEY,
        },
        label: messages.userSearchFilterLabel,
        children: defaultField,
      },
      {
        fieldProps: {
          name: GROUP_SEARCH_BASE_KEY,
        },
        label: messages.groupSearchBaseLabel,
        children: defaultField,
      },
      {
        fieldProps: {
          name: GROUP_SEARCH_FILTER_KEY,
        },
        label: messages.groupSearchFilterLabel,
        children: defaultField,
      },
      {
        fieldProps: {
          name: PASSWORD_ENCODER_TYPE_KEY,
          format: String,
          onChange: this.onChangePasswordEncoderType,
        },
        label: messages.passwordEncoderTypeLabel,
        children: <InputDropdown options={this.passwordEncoderOptions} mobileDisabled />,
      },
      {
        fieldProps: {
          name: EMAIL_KEY,
          validate: commonValidators.requiredField,
          required: true,
        },
        label: messages.emailAttributeLabel,
        children: <FieldErrorHint>{defaultField}</FieldErrorHint>,
      },
      {
        fieldProps: {
          name: FULL_NAME_KEY,
        },
        label: messages.fullNameAttributeLabel,
        children: defaultField,
      },
      {
        fieldProps: {
          name: PHOTO_KEY,
        },
        label: messages.photoAttributeLabel,
        children: defaultField,
      },
    ];

    if (passwordEncoderType) {
      const passwordField = {
        fieldProps: {
          name: PASSWORD_ATTRIBUTE_KEY,
        },
        label: messages.passwordAttributeLabel,
        children: defaultField,
      };
      fields.splice(9, 0, passwordField);
    }

    return fields;
  };

  formatConditionalValue = (fullValue) => {
    let formattedValue = {
      value: '',
      condition: this.urlConditions[0].value,
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

  urlConditions = [
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

  passwordEncoderOptions = [
    { value: '', label: 'NO' },
    { value: 'PLAIN', label: 'PLAIN' },
    { value: 'SHA', label: 'SHA' },
    { value: 'LDAP_SHA', label: 'LDAP_SHA' },
    { value: 'MD4', label: 'MD4' },
    { value: 'MD5', label: 'MD5' },
  ];

  render() {
    const {
      intl: { formatMessage },
      disabled,
      lineAlign,
    } = this.props;
    const fields = this.getFieldsConfig();

    return (
      <Fragment>
        {fields.map((item) => (
          <IntegrationFormField
            key={item.fieldProps.name}
            disabled={disabled}
            lineAlign={lineAlign}
            label={formatMessage(item.label)}
            {...item.fieldProps}
          >
            {item.children}
          </IntegrationFormField>
        ))}
      </Fragment>
    );
  }
}
