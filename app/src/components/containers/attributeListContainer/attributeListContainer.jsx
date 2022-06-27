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
import { useSelector } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { EditableAttributeList } from 'componentLibrary/attributeList/editableAttributeList';

export const AttributeListContainer = ({ value, keyURLCreator, valueURLCreator, ...rest }) => {
  const projectId = useSelector(activeProjectSelector);
  const getURIKey = keyURLCreator(projectId);
  const getURIValue = (key) => keyURLCreator(projectId, key);
  return (
    <EditableAttributeList
      attributes={value}
      getURIKey={getURIKey}
      getURIValue={getURIValue}
      {...rest}
    />
  );
};
AttributeListContainer.propTypes = {
  value: PropTypes.array,
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
};
AttributeListContainer.defaultProps = {
  value: [],
  keyURLCreator: () => {},
  valueURLCreator: () => {},
};
