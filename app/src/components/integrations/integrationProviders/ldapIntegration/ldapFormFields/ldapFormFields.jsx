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

import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { Dropdown, FieldText } from '@reportportal/ui-kit';
import { isEmptyObject } from 'common/utils/isEmptyObject';
import { validate, commonValidators, bindMessageToValidator } from 'common/utils/validation';
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
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
  NAME_TYPE_KEY,
  FIRST_NAME_KEY,
  LAST_NAME_KEY,
  FIRST_AND_LAST_NAME_KEY,
} from '../constants';
import { FieldTextConditional } from './fieldTextConditional';
import styles from './ldapFormFields.scss';

const cx = classNames.bind(styles);
const integrationFormValueSelector = formValueSelector(INTEGRATION_FORM);

const messages = defineMessages({
  urlLabel: {
    id: 'LdapFormFields.urlLabel',
    defaultMessage: 'URL',
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
  nameTypeLabel: {
    id: 'LdapFormFields.nameTypeLabel',
    defaultMessage: 'Name attributes mode',
  },
  fullNameAttributeLabel: {
    id: 'LdapFormFields.fullNameAttributeLabel',
    defaultMessage: 'Full name attribute',
  },
  firstNameAttributeLabel: {
    id: 'LdapFormFields.firstNameAttributeLabel',
    defaultMessage: 'First name',
  },
  lastNameAttributeLabel: {
    id: 'LdapFormFields.lastNameAttributeLabel',
    defaultMessage: 'Last name',
  },
  photoAttributeLabel: {
    id: 'LdapFormFields.photoAttributeLabel',
    defaultMessage: 'Photo attribute',
  },
  fullName: {
    id: 'LdapFormFields.fullName',
    defaultMessage: 'Full name',
  },
  firstAndLastName: {
    id: 'LdapFormFields.firstAndLastName',
    defaultMessage: 'First & last name',
  },
});

const urlValidator = bindMessageToValidator(validate.ldapUrl, 'requiredFieldHint');

function LdapFormFieldsComponent({
  initialize,
  change,
  stepNumber,
  disabled,
  lineAlign,
  initialData,
  passwordEncoderType,
  nameType,
  updateMetaData,
}) {
  const { formatMessage } = useIntl();

  useEffect(() => {
    const data = !isEmptyObject(initialData)
      ? {
          [PASSWORD_ENCODER_TYPE_KEY]: '',
          [NAME_TYPE_KEY]:
            initialData[FIRST_NAME_KEY] || initialData[LAST_NAME_KEY]
              ? FIRST_AND_LAST_NAME_KEY
              : FULL_NAME_KEY,
          ...initialData,
        }
      : DEFAULT_FORM_CONFIG;

    initialize(data);
    updateMetaData({
      [SECRET_FIELDS_KEY]: [MANAGER_PASSWORD_KEY, PASSWORD_ATTRIBUTE_KEY],
    });
  }, []);

  const onChangePasswordEncoderType = (event, value) => {
    if (!value) {
      change(PASSWORD_ATTRIBUTE_KEY, '');
    }
  };

  const onChangeNameType = () => {
    change(FULL_NAME_KEY, '');
    change(FIRST_NAME_KEY, '');
    change(LAST_NAME_KEY, '');
  };

  const urlConditions = [
    {
      value: LDAPS_PREFIX,
      label: LDAPS_PREFIX,
    },
    {
      value: LDAP_PREFIX,
      label: LDAP_PREFIX,
    },
  ];

  const nameOptions = [
    { value: FULL_NAME_KEY, label: formatMessage(messages.fullName) },
    { value: FIRST_AND_LAST_NAME_KEY, label: formatMessage(messages.firstAndLastName) },
  ];

  const formatConditionalValue = (fullValue) => {
    let formattedValue = {
      value: '',
      condition: urlConditions[0].value,
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

  const parseConditionalValue = (value) => value && `${value.condition}${value.value}`;

  const passwordEncoderOptions = [
    { value: '', label: 'NO' },
    { value: 'PLAIN', label: 'PLAIN' },
    { value: 'SHA', label: 'SHA' },
    { value: 'LDAP_SHA', label: 'LDAP_SHA' },
    { value: 'MD4', label: 'MD4' },
    { value: 'MD5', label: 'MD5' },
    { value: 'PBKDF2', label: 'PBKDF2_SHA1' },
    { value: 'PBKDF2_SHA256', label: 'PBKDF2_SHA256' },
    { value: 'PBKDF2_SHA512', label: 'PBKDF2_SHA512' },
  ];

  const getFieldsConfig = () => {
    const defaultField = <FieldText maxLength="128" defaultWidth={false} />;
    const maxField = <FieldText maxLength="256" defaultWidth={false} />;

    const firstStepFields = [
      {
        fieldProps: {
          name: URL_KEY,
          validate: urlValidator,
          format: formatConditionalValue,
          parse: parseConditionalValue,
          required: true,
        },
        label: messages.urlLabel,
        children: (
          <FieldErrorHint>
            <FieldTextConditional conditions={urlConditions} placeholder="example.com" />
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
          type: 'password',
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
          onChange: onChangePasswordEncoderType,
          placeholder: 'NO',
        },
        label: messages.passwordEncoderTypeLabel,
        children: <Dropdown options={passwordEncoderOptions} defaultWidth={false} mobileDisabled />,
      },
    ];

    const secondStepFields = [
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
          name: NAME_TYPE_KEY,
          format: String,
          onChange: onChangeNameType,
        },
        label: messages.nameTypeLabel,
        children: <Dropdown options={nameOptions} defaultWidth={false} mobileDisabled />,
      },
      {
        fieldProps: {
          name: PHOTO_KEY,
        },
        label: messages.photoAttributeLabel,
        children: defaultField,
      },
    ];

    const isFirstStep = stepNumber === 1;

    if (isFirstStep && passwordEncoderType) {
      const passwordField = {
        fieldProps: {
          name: PASSWORD_ATTRIBUTE_KEY,
        },
        label: messages.passwordAttributeLabel,
        children: defaultField,
      };
      firstStepFields.splice(9, 0, passwordField);
    }

    if (!isFirstStep) {
      const fullNameField = {
        fieldProps: {
          name: FULL_NAME_KEY,
        },
        label: messages.fullNameAttributeLabel,
        children: defaultField,
      };
      const firstNameField = {
        fieldProps: {
          name: FIRST_NAME_KEY,
        },
        label: messages.firstNameAttributeLabel,
        children: maxField,
      };
      const lastNameField = {
        fieldProps: {
          name: LAST_NAME_KEY,
        },
        label: messages.lastNameAttributeLabel,
        children: maxField,
      };

      if (nameType === FULL_NAME_KEY) {
        secondStepFields.splice(2, 0, fullNameField);
      } else {
        secondStepFields.splice(2, 0, firstNameField, lastNameField);
      }
    }

    if (isFirstStep) {
      return firstStepFields;
    }
    if (stepNumber) {
      return secondStepFields;
    }
    return [];
  };

  const fields = getFieldsConfig();

  return (
    <>
      {fields.map((item) => (
        <IntegrationFormField
          key={item.fieldProps.name}
          disabled={disabled}
          lineAlign={lineAlign}
          label={formatMessage(item.label)}
          formFieldContainerClassName={cx('field')}
          {...item.fieldProps}
        >
          {item.children}
        </IntegrationFormField>
      ))}
    </>
  );
}
LdapFormFieldsComponent.propTypes = {
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  stepNumber: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  lineAlign: PropTypes.bool,
  initialData: PropTypes.object,
  passwordEncoderType: PropTypes.string,
  nameType: PropTypes.string,
  updateMetaData: PropTypes.func,
};
LdapFormFieldsComponent.defaultProps = {
  disabled: false,
  lineAlign: false,
  initialData: DEFAULT_FORM_CONFIG,
  passwordEncoderType: '',
  nameType: FULL_NAME_KEY,
  updateMetaData: () => {},
};
export const LdapFormFields = connect((state) => ({
  passwordEncoderType: integrationFormValueSelector(state, PASSWORD_ENCODER_TYPE_KEY),
  nameType: integrationFormValueSelector(state, NAME_TYPE_KEY),
}))(LdapFormFieldsComponent);
