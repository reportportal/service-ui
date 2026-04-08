/*
 * Copyright 2026 EPAM Systems
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

import { Fragment, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { FieldText } from '@reportportal/ui-kit';
import { FieldArray } from 'redux-form';
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { isEmptyObject } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { IntegrationFormField } from 'components/integrations/elements';
import { commonValidators } from 'common/utils/validation';
import {
  CLIENT_ID_KEY,
  CLIENT_SECRET_KEY,
  ORGANIZATIONS_FIELD,
  DEFAULT_FORM_CONFIG,
} from '../constants';
import { GithubOrganizations } from './githubOrganizations';

const messages = defineMessages({
  clientIdLabel: {
    id: 'GithubAuthFormFields.clientIdLabel',
    defaultMessage: 'Client ID',
  },
  clientSecretLabel: {
    id: 'GithubAuthFormFields.clientSecretLabel',
    defaultMessage: 'Client secret',
  },
  clientIdPlaceholder: {
    id: 'GithubFormFields.clientIdPlaceholder',
    defaultMessage: 'Specify the client ID (e.g. Iv1.a1b2c3)',
  },
  clientSecretPlaceholder: {
    id: 'GithubFormFields.clientSecretPlaceholder',
    defaultMessage: 'Specify the client secret (e.g. a1b2c3…)',
  },
});

export interface GithubFormFieldsProps {
  initialize: (data: Record<string, unknown>) => void;
  disabled?: boolean;
  initialData?: Record<string, unknown>;
  updateMetaData?: (meta: Record<string, unknown>) => void;
  integrationId?: number | string;
}

export const GithubFormFields = ({
  initialize,
  disabled = false,
  initialData = {},
  updateMetaData = () => {},
  integrationId,
}: GithubFormFieldsProps) => {
  const { formatMessage } = useIntl();

  useEffect(() => {
    updateMetaData({
      [SECRET_FIELDS_KEY]: [CLIENT_SECRET_KEY],
    });
  }, [updateMetaData]);

  useEffect(() => {
    const source = !isEmptyObject(initialData) ? initialData : DEFAULT_FORM_CONFIG;
    initialize(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <IntegrationFormField
        name={CLIENT_ID_KEY}
        disabled={disabled}
        label={formatMessage(messages.clientIdLabel)}
        placeholder={formatMessage(messages.clientIdPlaceholder)}
        validate={commonValidators.requiredField}
        required
      >
        <FieldErrorHint>
          <FieldText defaultWidth={false} />
        </FieldErrorHint>
      </IntegrationFormField>
      <IntegrationFormField
        name={CLIENT_SECRET_KEY}
        disabled={disabled}
        label={formatMessage(messages.clientSecretLabel)}
        placeholder={formatMessage(messages.clientSecretPlaceholder)}
        validate={commonValidators.requiredField}
        required={integrationId == null}
      >
        <FieldErrorHint>
          <FieldText defaultWidth={false} type="password" />
        </FieldErrorHint>
      </IntegrationFormField>
      <FieldArray name={ORGANIZATIONS_FIELD} component={GithubOrganizations} props={{ disabled }} />
    </Fragment>
  );
};
