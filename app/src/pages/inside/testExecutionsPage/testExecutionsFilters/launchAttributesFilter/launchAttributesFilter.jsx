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

import React, { useState, useEffect } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { Button, FieldLabel, PlusIcon, Popover } from '@reportportal/ui-kit';
import { withFilter } from 'controllers/filter';
import { activeProjectSelector, idSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { AttributeEditor } from 'componentLibrary/attributeEditor';
import { formatAttribute, parseQueryAttributes } from 'common/utils/attributeUtils';
import { EditableAttribute } from 'componentLibrary/attributeList/editableAttribute';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FILTER_KEYS } from '../constants';
import { getStoredFilter, setStoredFilter } from '../utils';
import styles from './launchAttributesFilter.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  label: {
    id: 'TestExecutionsPage.filters.attributesLabel',
    defaultMessage: 'Launch attributes',
  },
  addAttributeButton: {
    id: 'TestExecutionsPage.filters.addAttributeButton',
    defaultMessage: 'Add attribute',
  },
  keyPlaceholder: {
    id: 'TestExecutionsPage.filters.keyPlaceholder',
    defaultMessage: 'Specify key',
  },
  valuePlaceholder: {
    id: 'TestExecutionsPage.filters.valuePlaceholder',
    defaultMessage: 'Specify value',
  },
});

const LaunchAttributesFilterComponent = ({ filter, onFilterChange }) => {
  const { formatMessage } = useIntl();
  const activeProject = useSelector(activeProjectSelector);
  const userId = useSelector(idSelector);
  const [isOpened, setIsOpened] = useState(false);
  const [attributes, setAttributes] = useState([]);

  const getURIKey = URLS.launchAttributeKeysSearch(activeProject);
  const getURIValue = (key) => URLS.launchAttributeValuesSearch(activeProject, key);

  useEffect(() => {
    if (filter) {
      const parsedAttributes = parseQueryAttributes({ value: filter });
      setAttributes(parsedAttributes);
    } else {
      setAttributes([]);
    }
  }, [filter]);

  useEffect(() => {
    if (userId && activeProject) {
      const stored = getStoredFilter(userId, activeProject, FILTER_KEYS.ATTRIBUTES);
      if (stored && !filter) {
        onFilterChange(stored);
      }
    }
  }, [filter, onFilterChange, userId, activeProject]);

  const handleAddAttribute = () => {
    setIsOpened(true);
  };

  const handleChange = (newAttributes) => {
    setAttributes(newAttributes);
    const formattedAttributes = newAttributes.map(formatAttribute).join(',');
    if (userId && activeProject) {
      setStoredFilter(userId, activeProject, FILTER_KEYS.ATTRIBUTES, formattedAttributes);
    }
    onFilterChange(formattedAttributes);
  };

  const handleConfirm = (attribute) => {
    const updatedAttributes = [...attributes, attribute];
    handleChange(updatedAttributes);
    setIsOpened(false);
  };

  const handleCancel = () => {
    setIsOpened(false);
  };

  const handleRemove = (allAttributes, index, onChange) => () => {
    const newAttributes = [...allAttributes];
    newAttributes.splice(index, 1);
    onChange(newAttributes);
  };

  return (
    <div>
      <FieldLabel>{formatMessage(messages.label)}</FieldLabel>
      <div className={cx('attributes-list')}>
        {attributes.length > 0 &&
          attributes.map((attribute, index) => (
            <EditableAttribute
              key={`${attribute.key}_${attribute.value}`}
              attribute={attribute}
              onRemove={handleRemove(attributes, index, handleChange)}
            />
          ))}
        <Popover
          isOpened={isOpened}
          setIsOpened={setIsOpened}
          onClose={handleCancel}
          content={
            <AttributeEditor
              attributes={attributes}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              getURIKey={getURIKey}
              getURIValue={getURIValue}
              keyLabel={formatMessage(COMMON_LOCALE_KEYS.KEY)}
              valueLabel={formatMessage(COMMON_LOCALE_KEYS.VALUE)}
              keyPlaceholder={formatMessage(messages.keyPlaceholder)}
              valuePlaceholder={formatMessage(messages.valuePlaceholder)}
              autocompleteProps={{
                newOptionCreatable: false,
              }}
            />
          }
        >
          <Button
            variant="text"
            adjustWidthOn="content"
            icon={<PlusIcon />}
            onClick={handleAddAttribute}
            className={cx('add-attribute-button')}
          >
            {formatMessage(messages.addAttributeButton)}
          </Button>
        </Popover>
      </div>
    </div>
  );
};

LaunchAttributesFilterComponent.propTypes = {
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export const LaunchAttributesFilter = withFilter({
  filterKey: FILTER_KEYS.ATTRIBUTES,
})(LaunchAttributesFilterComponent);
