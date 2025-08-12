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
import { noop } from 'lodash';

import { AttributeList } from 'componentLibrary/attributeList';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';

import { messages } from '../messages';

const AttributeListField = ({ input, ...rest }) => (
  <AttributeList
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...input}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}
    attributes={input.value || []}
    onChange={input.onChange}
    customClass=""
  />
);

export const TestPlanAttributes = () => {
  const { formatMessage } = useIntl();

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
          getURIKey={noop}
          getURIValue={noop}
          minLength={9999}
          autocompleteProps={{
            onStateChange: () => {},
            options: [],
            async: false,
          }}
        />
      </FieldElement>
    </div>
  );
};
