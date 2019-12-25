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
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { IntegrationFormField } from 'components/integrations/elements';
import { commonValidators } from 'common/utils/validation';
import {
  FIRST_NAME_ATTRIBUTE_KEY,
  LAST_NAME_ATTRIBUTE_KEY,
  FULL_NAME_ATTRIBUTE_KEY,
} from '../constants';

const messages = defineMessages({
  identityProviderNameId: {
    id: 'SamlFormFields.identityProviderNameId',
    defaultMessage: 'Identity provider name ID',
  },
  providerName: {
    id: 'SamlFormFields.providerName',
    defaultMessage: 'Provider name',
  },
  metadataUrl: {
    id: 'SamlFormFields.metadataUrl',
    defaultMessage: 'Metadata URL',
  },
  emailAttribute: {
    id: 'SamlFormFields.emailAttribute',
    defaultMessage: 'Email',
  },
  nameAttributesMode: {
    id: 'SamlFormFields.nameAttributesMode',
    defaultMessage: 'Name attributes mode',
  },
  fullNameAttribute: {
    id: 'SamlFormFields.fullNameAttribute',
    defaultMessage: 'Full name',
  },
  firstNameAttribute: {
    id: 'SamlFormFields.firstNameAttribute',
    defaultMessage: 'First name',
  },
  lastNameAttribute: {
    id: 'SamlFormFields.lastNameAttribute',
    defaultMessage: 'Last name',
  },
});

@injectIntl
export class SamlFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
  };

  static defaultProps = {
    disabled: false,
    lineAlign: false,
    initialData: {},
  };

  constructor(props) {
    super(props);
    this.nameAttributesOptions = [
      { value: true, label: 'Full name' },
      { value: false, label: 'First & last name' },
    ];
    this.state = {
      isFullNameAttributeMode: false,
    };
  }

  componentDidMount() {
    this.props.initialize(this.props.initialData);
  }

  onChangeNameAttributesMode = (isFullNameAttributeMode) => {
    if (isFullNameAttributeMode === this.state.isFullNameAttributeMode) {
      return;
    }

    this.setState({
      isFullNameAttributeMode,
    });

    if (isFullNameAttributeMode) {
      this.props.change(FIRST_NAME_ATTRIBUTE_KEY, '');
      this.props.change(LAST_NAME_ATTRIBUTE_KEY, '');
    } else {
      this.props.change(FULL_NAME_ATTRIBUTE_KEY, '');
    }
  };

  render() {
    const {
      intl: { formatMessage },
      disabled,
      lineAlign,
    } = this.props;

    return (
      <Fragment>
        <IntegrationFormField
          name="identityProviderNameId"
          disabled={disabled}
          label={formatMessage(messages.identityProviderNameId)}
          lineAlign={lineAlign}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="identityProviderName"
          disabled={disabled}
          label={formatMessage(messages.providerName)}
          validate={commonValidators.requiredField}
          lineAlign={lineAlign}
          required
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="identityProviderMetadataUrl"
          disabled={disabled}
          label={formatMessage(messages.metadataUrl)}
          validate={commonValidators.requiredField}
          lineAlign={lineAlign}
          required
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          name="emailAttribute"
          disabled={disabled}
          label={formatMessage(messages.emailAttribute)}
          validate={commonValidators.requiredField}
          lineAlign={lineAlign}
          required
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </IntegrationFormField>
        <IntegrationFormField
          label={formatMessage(messages.nameAttributesMode)}
          lineAlign={lineAlign}
          withoutProvider
        >
          <InputDropdown
            value={this.state.isFullNameAttributeMode}
            onChange={this.onChangeNameAttributesMode}
            options={this.nameAttributesOptions}
            disabled={disabled}
            mobileDisabled
          />
        </IntegrationFormField>
        {this.state.isFullNameAttributeMode ? (
          <IntegrationFormField
            name={FULL_NAME_ATTRIBUTE_KEY}
            disabled={disabled}
            label={formatMessage(messages.fullNameAttribute)}
            lineAlign={lineAlign}
            required
          >
            <FieldErrorHint>
              <Input mobileDisabled />
            </FieldErrorHint>
          </IntegrationFormField>
        ) : (
          <Fragment>
            <IntegrationFormField
              name={FIRST_NAME_ATTRIBUTE_KEY}
              disabled={disabled}
              label={formatMessage(messages.firstNameAttribute)}
              validate={commonValidators.requiredField}
              lineAlign={lineAlign}
              required
            >
              <FieldErrorHint>
                <Input mobileDisabled />
              </FieldErrorHint>
            </IntegrationFormField>
            <IntegrationFormField
              name={LAST_NAME_ATTRIBUTE_KEY}
              disabled={disabled}
              label={formatMessage(messages.lastNameAttribute)}
              validate={commonValidators.requiredField}
              lineAlign={lineAlign}
              required
            >
              <FieldErrorHint>
                <Input mobileDisabled />
              </FieldErrorHint>
            </IntegrationFormField>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
