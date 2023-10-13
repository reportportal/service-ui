/*
 * Copyright 2022 EPAM Systems
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

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { AttributeList } from './attributeList';

const NEW_ATTRIBUTE = {
  system: false,
  edited: true,
  new: true,
};

export const EditableAttributeList = ({
  attributes,
  onChange,
  disabled,
  newAttrMessage,
  maxLength,
  customClass,
  showButton,
  editable,
  defaultOpen,
  ...rest
}) => {
  const handleAddNew = () => {
    onChange([...attributes, NEW_ATTRIBUTE]);
  };
  useEffect(() => {
    if (defaultOpen && !attributes.length) {
      handleAddNew();
    }
  }, [disabled, attributes]);

  const handleChange = (attr) => {
    onChange(attr);
  };

  return (
    <AttributeList
      attributes={attributes}
      onChange={handleChange}
      onRemove={handleChange}
      onAddNew={handleAddNew}
      newAttrMessage={newAttrMessage}
      disabled={disabled}
      maxLength={maxLength}
      customClass={customClass}
      showButton={showButton}
      editable={editable}
      editorDefaultOpen={defaultOpen}
      {...rest}
    />
  );
};

EditableAttributeList.propTypes = {
  attributes: PropTypes.arrayOf(PropTypes.object),
  disabled: PropTypes.bool,
  newAttrMessage: PropTypes.string,
  onChange: PropTypes.func,
  maxLength: PropTypes.number,
  customClass: PropTypes.string,
  showButton: PropTypes.bool,
  editable: PropTypes.bool,
  defaultOpen: PropTypes.bool,
};

EditableAttributeList.defaultProps = {
  attributes: [],
  value: [],
  disabled: false,
  newAttrMessage: '',
  onChange: () => {},
  maxLength: Infinity,
  customClass: '',
  showButton: true,
  editable: true,
  defaultOpen: false,
};
