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

import { EditableAttributeList } from 'componentLibrary/attributeList/editableAttributeList';

import { AttributeListFieldProps } from './types';

export const AttributeListField = ({
  input,
  newAttrMessage,
  maxLength,
  showButton,
  editable,
  defaultOpen,
  ...rest
}: AttributeListFieldProps) => (
  <EditableAttributeList
    attributes={input.value || []}
    onChange={input.onChange}
    disabled={false}
    customClass=""
    newAttrMessage={newAttrMessage || ''}
    maxLength={maxLength || 50}
    showButton={showButton !== undefined ? showButton : true}
    editable={editable !== undefined ? editable : true}
    defaultOpen={defaultOpen !== undefined ? defaultOpen : false}
    {...rest}
  />
);
