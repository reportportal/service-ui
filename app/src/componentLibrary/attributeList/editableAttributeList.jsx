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
  keyURLCreator,
  valueURLCreator,
  newAttrMessage,
  maxLength,
  customClass,
  showButton,
  editable,
  eventsInfo,
  trackEvent,
  ...rest
}) => {
  const handleAddNew = () => {
    onChange([...attributes, NEW_ATTRIBUTE]);
  };

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
      keyURLCreator={keyURLCreator}
      valueURLCreator={valueURLCreator}
      maxLength={maxLength}
      customClass={customClass}
      showButton={showButton}
      editable={editable}
      eventsInfo={eventsInfo}
      trackEvent={trackEvent}
      {...rest}
    />
  );
};

EditableAttributeList.propTypes = {
  attributes: PropTypes.arrayOf(PropTypes.object),
  disabled: PropTypes.bool,
  newAttrMessage: PropTypes.string,
  onChange: PropTypes.func,
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
  maxLength: PropTypes.number,
  customClass: PropTypes.string,
  showButton: PropTypes.bool,
  editable: PropTypes.bool,
  eventsInfo: PropTypes.object,
  trackEvent: PropTypes.func,
};

EditableAttributeList.defaultProps = {
  attributes: [],
  disabled: false,
  newAttrMessage: '',
  onChange: () => {},
  keyURLCreator: null,
  valueURLCreator: null,
  maxLength: Infinity,
  customClass: '',
  showButton: true,
  editable: true,
  eventsInfo: {},
  trackEvent: () => {},
};
