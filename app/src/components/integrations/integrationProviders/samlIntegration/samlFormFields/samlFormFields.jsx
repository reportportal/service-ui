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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl, defineMessages } from 'react-intl';
import { FieldText, Dropdown } from '@reportportal/ui-kit';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { IntegrationFormField } from 'components/integrations/elements';
import { commonValidators } from 'common/utils/validation';
import {
  FIRST_NAME_ATTRIBUTE_KEY,
  LAST_NAME_ATTRIBUTE_KEY,
  FULL_NAME_ATTRIBUTE_KEY,
  CALLBACK_URL_ATTRIBUTE_KEY,
  PROVIDER_NAME_PLACEHOLDER,
  CALLBACK_URL_PATH,
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

const nameAttributesOptions = [
  { value: true, label: 'Full name' },
  { value: false, label: 'First & last name' },
];

const MAX_INPUT_LENGTH = 256;

const configureCallbackUrl = (providerName = '') => {
  const { origin, pathname } = location;

  const uiPath = 'ui';
  const pathParts = pathname.split('/');
  const index = pathParts.indexOf(uiPath);
  const basePath = pathParts
    .slice(0, index !== -1 ? index : pathParts.length)
    .filter(Boolean)
    .join('/');

  const encodedProviderName = encodeURIComponent(providerName || PROVIDER_NAME_PLACEHOLDER);
  const path = `/${basePath}/${CALLBACK_URL_PATH}/${encodedProviderName}`.replace(/\/{2,}/g, '/');

  return `${origin}${path}`;
};

export const SamlFormFields = ({
  initialize,
  change,
  disabled = false,
  lineAlign = false,
  initialData = {},
  pluginDetails = {},
}) => {
  const { formatMessage } = useIntl();
  const isFirstRender = useRef(true);
  const [isFullNameAttributeMode, setIsFullNameAttributeMode] = useState(
    !!initialData[FULL_NAME_ATTRIBUTE_KEY],
  );

  const onChangeNameAttributesMode = useCallback(
    (isFullNameAttributeModeValue) => {
      if (isFullNameAttributeModeValue === isFullNameAttributeMode) {
        return;
      }

      setIsFullNameAttributeMode(isFullNameAttributeModeValue);

      if (isFullNameAttributeModeValue) {
        change(FIRST_NAME_ATTRIBUTE_KEY, '');
        change(LAST_NAME_ATTRIBUTE_KEY, '');
      } else {
        change(FULL_NAME_ATTRIBUTE_KEY, '');
      }
    },
    [isFullNameAttributeMode, change],
  );

  const onChangeProviderName = useCallback(
    (event) => {
      change(CALLBACK_URL_ATTRIBUTE_KEY, configureCallbackUrl(event.target.value));
    },
    [change],
  );

  useEffect(() => {
    if (isFirstRender.current) return;

    initialize(initialData);
    // should handle only fullNameAttribute changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData.fullNameAttribute]);

  useEffect(() => {
    if (isFirstRender.current) return;

    change(CALLBACK_URL_ATTRIBUTE_KEY, configureCallbackUrl(initialData.identityProviderName));
    // should handle only identityProviderName changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData.identityProviderName]);

  useEffect(() => {
    initialize({
      ...initialData,
      ...pluginDetails,
      [CALLBACK_URL_ATTRIBUTE_KEY]: configureCallbackUrl(initialData.identityProviderName),
    });
    isFirstRender.current = false;
    // first render initialization only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <IntegrationFormField
        name="identityProviderNameId"
        disabled={disabled}
        label={formatMessage(messages.identityProviderNameId)}
        lineAlign={lineAlign}
      >
        <FieldText maxLength={MAX_INPUT_LENGTH} defaultWidth={false} />
      </IntegrationFormField>
      <IntegrationFormField
        name="identityProviderName"
        disabled={disabled}
        label={formatMessage(messages.providerName)}
        validate={commonValidators.requiredField}
        lineAlign={lineAlign}
        onChange={onChangeProviderName}
        required
      >
        <FieldErrorHint>
          <FieldText maxLength={MAX_INPUT_LENGTH} defaultWidth={false} />
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
          <FieldText maxLength={MAX_INPUT_LENGTH} defaultWidth={false} />
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
          <FieldText maxLength={MAX_INPUT_LENGTH} defaultWidth={false} />
        </FieldErrorHint>
      </IntegrationFormField>
      <IntegrationFormField
        name={CALLBACK_URL_ATTRIBUTE_KEY}
        label="Assertion Consumer Service (ACS) URL"
        lineAlign={lineAlign}
        placeholder={configureCallbackUrl()}
        disabled
      >
        <FieldText maxLength={MAX_INPUT_LENGTH} defaultWidth={false} />
      </IntegrationFormField>
      <IntegrationFormField
        label={formatMessage(messages.nameAttributesMode)}
        lineAlign={lineAlign}
        withoutProvider
      >
        <Dropdown
          value={isFullNameAttributeMode}
          onChange={onChangeNameAttributesMode}
          options={nameAttributesOptions}
          disabled={disabled}
          defaultWidth={false}
          mobileDisabled
        />
      </IntegrationFormField>
      {isFullNameAttributeMode ? (
        <IntegrationFormField
          name={FULL_NAME_ATTRIBUTE_KEY}
          disabled={disabled}
          label={formatMessage(messages.fullNameAttribute)}
          validate={commonValidators.requiredField}
          lineAlign={lineAlign}
          required
        >
          <FieldErrorHint>
            <FieldText maxLength={MAX_INPUT_LENGTH} defaultWidth={false} />
          </FieldErrorHint>
        </IntegrationFormField>
      ) : (
        <>
          <IntegrationFormField
            name={FIRST_NAME_ATTRIBUTE_KEY}
            disabled={disabled}
            label={formatMessage(messages.firstNameAttribute)}
            validate={commonValidators.requiredField}
            lineAlign={lineAlign}
            required
          >
            <FieldErrorHint>
              <FieldText maxLength={MAX_INPUT_LENGTH} defaultWidth={false} />
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
              <FieldText maxLength={MAX_INPUT_LENGTH} defaultWidth={false} />
            </FieldErrorHint>
          </IntegrationFormField>
        </>
      )}
    </>
  );
};

SamlFormFields.propTypes = {
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  lineAlign: PropTypes.bool,
  initialData: PropTypes.object,
  pluginDetails: PropTypes.object,
};
