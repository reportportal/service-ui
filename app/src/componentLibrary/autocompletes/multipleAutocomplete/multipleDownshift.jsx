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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import isEqual from 'fast-deep-equal';
import { isArray } from 'c3/src/util';

export const MultipleDownshift = ({
  selectedItems,
  children,
  onChange,
  handleUnStoredItemCb,
  options,
  isExistingLaunchNames,
  ...props
}) => {
  const [storedItemsMap, setStoredItems] = useState(isExistingLaunchNames);

  const collectStoredItems = (newItemData, collectStoredItemsCb) => {
    const newState = {
      ...storedItemsMap,
    };
    newItemData.forEach((item) => {
      if (options.includes(item)) {
        newState[item] = true;
      }
    });
    setStoredItems(newState);
    collectStoredItemsCb(newState);
  };
  const filterStoredItems = (removedItem, filterStoredItemsCb) => {
    if (removedItem in storedItemsMap) {
      const newState = { ...storedItemsMap };
      delete newState[removedItem];
      setStoredItems(newState);
      filterStoredItemsCb(newState);
    } else {
      filterStoredItemsCb(storedItemsMap);
    }
  };
  const addSelectedItem = (newItemData, downshift) => {
    const newItem = isArray(newItemData) ? newItemData : [newItemData];
    const filteredSelectedItems = selectedItems.filter((item) => newItem.indexOf(item) < 0);
    const newSelectedItems = [...filteredSelectedItems, ...newItem];
    onChange(newSelectedItems, downshift);
    const collectStoredItemsCb = (storedItems) =>
      handleUnStoredItemCb && handleUnStoredItemCb(newSelectedItems, storedItems);
    collectStoredItems(newItem, collectStoredItemsCb);
  };
  const editItem = (oldItem, newItem) => {
    const position = selectedItems.indexOf(oldItem);
    const newValue = [...selectedItems];
    newValue.splice(position, 1, newItem);
    onChange(newValue);
  };
  const removeItem = (removedItem, downshift) => {
    const newSelectedItems = selectedItems.filter((item) => !isEqual(item, removedItem));
    onChange(newSelectedItems, downshift);
    const filterStoredItemsCb = (storedItems) =>
      handleUnStoredItemCb && handleUnStoredItemCb(newSelectedItems, storedItems);
    filterStoredItems(removedItem, filterStoredItemsCb);
  };
  const handleSelection = (selectedItem, downshift) => {
    if (!selectedItem) return;
    addSelectedItem(selectedItem, downshift);
  };
  const getStateAndHelpers = (downshift) => ({
    removeItem,
    editItem,
    handleChange: onChange,
    storedItemsMap,
    ...downshift,
  });
  const stateReducer = (state, changes) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        return {
          ...changes,
          highlightedIndex: state.highlightedIndex,
          inputValue: '',
        };
      default:
        return changes;
    }
  };

  return (
    <Downshift
      {...props}
      stateReducer={stateReducer}
      onChange={handleSelection}
      selectedItem={null}
    >
      {(downshift) => children(getStateAndHelpers(downshift))}
    </Downshift>
  );
};
MultipleDownshift.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  children: PropTypes.func.isRequired,
  selectedItems: PropTypes.array,
  handleUnStoredItemCb: PropTypes.func,
  isExistingLaunchNames: PropTypes.shape({
    value: PropTypes.bool,
  }),
};

MultipleDownshift.defaultProps = {
  options: [],
  onChange: () => {},
  selectedItems: [],
  handleUnStoredItemCb: null,
  isExistingLaunchNames: {},
};
