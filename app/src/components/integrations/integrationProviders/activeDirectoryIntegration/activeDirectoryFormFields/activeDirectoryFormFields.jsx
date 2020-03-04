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
import classNames from 'classnames/bind';
import { validate, commonValidators, bindMessageToValidator } from 'common/utils/validation';
import { isEmptyObject } from 'common/utils/isEmptyObject';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { InputConditional } from 'components/inputs/inputConditional';
import { IntegrationFormField } from 'components/integrations/elements';

import {
  DEFAULT_FORM_CONFIG,
  DOMAIN_KEY,
  URL_KEY,
  FULL_NAME_KEY,
  PHOTO_KEY,
  BASE_DN_KEY,
  EMAIL_KEY,
  LDAP_PREFIX,
  LDAPS_PREFIX,
} from '../constants';
import styles from './activeDirectoryFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  domainLabel: {
    id: 'ActiveDirectoryFormFields.domainLabel',
    defaultMessage: 'Domain',
  },
  urlLabel: {
    id: 'ActiveDirectoryFormFields.urlLabel',
    defaultMessage: 'Url',
  },
  baseDnLabel: {
    id: 'ActiveDirectoryFormFields.baseDnLabel',
    defaultMessage: 'Base DN',
  },
  emailAttributeLabel: {
    id: 'ActiveDirectoryFormFields.emailAttributeLabel',
    defaultMessage: 'Email attribute',
  },
  fullNameAttributeLabel: {
    id: 'ActiveDirectoryFormFields.fullNameAttributeLabel',
    defaultMessage: 'Full name attribute',
  },
  photoAttributeLabel: {
    id: 'ActiveDirectoryFormFields.photoAttributeLabel',
    defaultMessage: 'Photo attribute',
  },
});

const urlValidator = bindMessageToValidator(validate.ldapUrl, 'requiredFieldHint');

@injectIntl
export class ActiveDirectoryFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
    passwordEncoderType: PropTypes.string,
  };

  static defaultProps = {
    disabled: false,
    lineAlign: false,
    initialData: DEFAULT_FORM_CONFIG,
    passwordEncoderType: '',
  };

  componentDidMount() {
    const { initialData, initialize } = this.props;
    const data = isEmptyObject(initialData) ? DEFAULT_FORM_CONFIG : initialData;

    initialize(data);
  }

  getFieldsConfig = () => {
    const defaultField = <Input maxLength="128" mobileDisabled />;

    const fields = [
      {
        fieldProps: {
          name: DOMAIN_KEY,
          validate: commonValidators.requiredField,
          required: true,
        },
        label: messages.domainLabel,
        children: <FieldErrorHint>{defaultField}</FieldErrorHint>,
      },
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
