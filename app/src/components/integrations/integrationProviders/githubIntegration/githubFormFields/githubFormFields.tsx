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
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { commonValidators } from 'common/utils/validation';
import {
  CLIENT_ID_KEY,
  CLIENT_SECRET_KEY,
  ORGANIZATIONS_FIELD,
  DEFAULT_FORM_CONFIG,
  GITHUB_CLIENT_CREDENTIAL_MAX_LENGTH,
} from '../constants';
import { GithubOrganizations } from './githubOrganizations';
import { GithubFormData } from '../types';

const messages = defineMessages({
  clientIdLabel: {
    id: 'GithubFormFields.clientIdLabel',
    defaultMessage: 'Client ID',
  },
  clientSecretLabel: {
    id: 'GithubFormFields.clientSecretLabel',
    defaultMessage: 'Client secret',
  },
  clientIdPlaceholder: {
    id: 'GithubFormFields.clientIdPlaceholder',
    defaultMessage: 'Specify the client ID (e.g. lv1.a1b2c3)',
  },
  clientSecretPlaceholder: {
    id: 'GithubFormFields.clientSecretPlaceholder',
    defaultMessage: 'Specify the client secret (e.g. a1b2c3…)',
  },
});

export interface GithubFormFieldsProps {
  initialize: (data: GithubFormData) => void;
  disabled?: boolean;
  initialData?: GithubFormData | null;
  updateMetaData?: (meta: Record<string, unknown>) => void;
}

export const GithubFormFields = ({
  initialize,
  disabled = false,
  initialData = null,
  updateMetaData = () => {},
}: GithubFormFieldsProps) => {
  const { formatMessage } = useIntl();

  useEffect(() => {
    updateMetaData({
      [SECRET_FIELDS_KEY]: [CLIENT_SECRET_KEY],
    });
  }, [updateMetaData]);

  useEffect(() => {
    const source = initialData && !isEmptyObject(initialData) ? initialData : DEFAULT_FORM_CONFIG;
    const rawOrgs = source.restrictions?.organizations ?? [];
    const organizations = rawOrgs.length > 0 ? rawOrgs : [''];
    initialize({
      ...source,
      restrictions: {
        organizations,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  return (
    <Fragment>
      <FieldElement
        name={CLIENT_ID_KEY}
        disabled={disabled}
        label={formatMessage(messages.clientIdLabel)}
        placeholder={formatMessage(messages.clientIdPlaceholder)}
        validate={commonValidators.requiredField}
        isRequired
      >
        <FieldErrorHint provideHint={false}>
          <FieldText defaultWidth={false} maxLength={GITHUB_CLIENT_CREDENTIAL_MAX_LENGTH} />
        </FieldErrorHint>
      </FieldElement>
      <FieldElement
        name={CLIENT_SECRET_KEY}
        disabled={disabled}
        label={formatMessage(messages.clientSecretLabel)}
        placeholder={formatMessage(messages.clientSecretPlaceholder)}
        validate={commonValidators.requiredField}
        isRequired
      >
        <FieldErrorHint provideHint={false}>
          <FieldText
            defaultWidth={false}
            type="password"
            maxLength={GITHUB_CLIENT_CREDENTIAL_MAX_LENGTH}
          />
        </FieldErrorHint>
      </FieldElement>
      <FieldArray name={ORGANIZATIONS_FIELD} component={GithubOrganizations} props={{ disabled }} />
    </Fragment>
  );
};
