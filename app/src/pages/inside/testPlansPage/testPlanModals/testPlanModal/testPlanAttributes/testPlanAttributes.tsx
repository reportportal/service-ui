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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Field, WrappedFieldProps } from 'redux-form';

import { AttributeList } from 'componentLibrary/attributeList';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';

import { useTmsAttributes } from './useTmsAttributes';
import { messages } from '../messages';
import { last } from 'es-toolkit';

interface AttributeItem {
  id?: number;
  key?: string;
  value: string;
}

export const TestPlanAttributes = () => {
  const { formatMessage } = useIntl();
  const { getTmsAttributeKeys, getTmsAttributeValues, createTmsAttribute } = useTmsAttributes();

  const renderAttributeList = useCallback(
    ({ input }: WrappedFieldProps) => {
      const handleAttributeChange = async (attributes: AttributeItem[]) => {
        const currentAttribute = last(attributes);
        const isNewAttribute = currentAttribute && currentAttribute.key && !currentAttribute.id;

        if (isNewAttribute) {
          try {
            const createdAttribute = (await createTmsAttribute(currentAttribute.key)) as {
              id: number;
              key: string;
            };
            const updatedAttributes = [...attributes];

            updatedAttributes[updatedAttributes.length - 1] = {
              ...currentAttribute,
              id: createdAttribute.id,
            };

            input.onChange(updatedAttributes);
          } catch {
            input.onChange(attributes);
          }
        } else {
          input.onChange(attributes);
        }
      };

      const attributesList = Array.isArray(input.value) ? (input.value as AttributeItem[]) : [];

      return (
        <AttributeList
          attributes={attributesList}
          showButton
          newAttrMessage={formatMessage(messages.addAttributes)}
          maxLength={50}
          editable
          defaultOpen={false}
          disabled={false}
          customClass=""
          autocompleteProps={{
            async: true,
            minLength: 1,
            makeOptions: (response: { content: AttributeItem[] }) =>
              response?.content?.map((attr) => attr.key) || [],
          }}
          getURIKey={getTmsAttributeKeys}
          getURIValue={getTmsAttributeValues}
          onChange={handleAttributeChange}
        />
      );
    },
    [formatMessage, getTmsAttributeKeys, getTmsAttributeValues, createTmsAttribute],
  );

  return (
    <div>
      <FieldElement label={formatMessage(messages.testPlanAttributes)} withoutProvider>
        <Field name="attributes" component={renderAttributeList} />
      </FieldElement>
    </div>
  );
};
