/*
 * Copyright 2025 EPAM Systems
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

import { useIntl } from 'react-intl';
import { Field } from 'redux-form';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';

import { AttributeList } from 'componentLibrary/attributeList';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { projectKeySelector } from 'controllers/project';
import { URLS } from 'common/urls';

import { messages } from '../messages';

interface AttributeListFieldProps {
  input: {
    value: unknown[];
    onChange: VoidFunction;
  };
  meta?: {
    submitFailed?: boolean;
  };
  attributes: Record<string, unknown>[];
  onChange: VoidFunction;
  disabled: boolean;
  newAttrMessage: string;
  maxLength: number;
  customClass: string;
  showButton: boolean;
  editable: boolean;
  defaultOpen: boolean;
  isAttributeKeyRequired?: boolean;
  isAttributeValueRequired?: boolean;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

const AttributeListField = ({ input, meta, ...rest }: AttributeListFieldProps) => (
  <AttributeList
    {...input}
    {...rest}
    attributes={input.value || []}
    onChange={input.onChange}
    customClass=""
    showValidationErrors={Boolean(meta?.submitFailed)}
  />
);

export const TestPlanAttributes = () => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const getURIKey = useCallback(
    (search = '') => URLS.tmsAttributeKeysSearch(projectKey, { search }),
    [projectKey],
  );

  const getURIValue = useCallback(
    () =>
      (search = '') =>
        URLS.tmsAttributeValuesSearch(projectKey, { search }),
    [projectKey],
  );

  return (
    <div>
      <FieldElement label={formatMessage(messages.testPlanAttributes)} withoutProvider>
        <Field
          name="attributes"
          component={AttributeListField}
          showButton
          newAttrMessage={formatMessage(messages.addAttributes)}
          maxLength={50}
          editable
          defaultOpen={false}
          isAttributeKeyRequired
          isAttributeValueRequired
          keyPlaceholder={formatMessage(messages.attributeKeyPlaceholderRequired)}
          valuePlaceholder={formatMessage(messages.attributeValuePlaceholderRequired)}
          getURIKey={getURIKey}
          getURIValue={getURIValue}
        />
      </FieldElement>
    </div>
  );
};
