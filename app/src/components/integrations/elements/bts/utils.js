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

import {
  AUTOCOMPLETE_TYPE,
  MULTIPLE_AUTOCOMPLETE_TYPE,
} from 'components/fields/dynamicFieldsSection/constants';

export const getDefectFormFields = (fields, checkedFieldsIds, values) =>
  fields
    .filter((item) => item.required || checkedFieldsIds[item.id])
    .map((item) => {
      const isAutocomplete =
        item.fieldType === AUTOCOMPLETE_TYPE || item.fieldType === MULTIPLE_AUTOCOMPLETE_TYPE;
      return {
        ...item,
        value: isAutocomplete ? undefined : values[item.id],
        namedValue: isAutocomplete ? values[item.id] : undefined,
      };
    });
