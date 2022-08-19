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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import isEqual from 'fast-deep-equal';
import { isArray } from 'c3/src/util';

export class MultipleDownshift extends Component {
  static propTypes = {
    options: PropTypes.array,
    onChange: PropTypes.func,
    children: PropTypes.func.isRequired,
    selectedItems: PropTypes.array,
    handleUnStoredItemCb: PropTypes.func,
  };

  static defaultProps = {
    options: [],
    onChange: () => {},
    selectedItems: [],
    handleUnStoredItemCb: null,
  };

  state = {
    storedItemsMap: {},
  };

  collectStoredItemsMap = (newItemData, cb) => {
    const { options } = this.props;
    const { storedItemsMap } = this.state;
    const newState = {
      ...storedItemsMap,
    };
    newItemData.forEach((item) => {
      if (options.includes(item)) {
        newState[item] = true;
      }
    });
    this.setState(
      {
        storedItemsMap: newState,
      },
      cb(newState),
    );
  };
  filterStoredItemsMap = (removedItem, cb) => {
    const { storedItemsMap } = this.state;
    if (removedItem in storedItemsMap) {
      const newState = { ...storedItemsMap };
      delete newState[removedItem];
      this.setState(
        {
          storedItemsMap: newState,
        },
        cb(newState),
      );
    } else {
      cb(storedItemsMap);
    }
  };
  stateReducer = (state, changes) => {
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
  handleChange = (selectedItems, downshift) =>
    this.props.onChange(selectedItems, this.getStateAndHelpers(downshift));
  addSelectedItem = (newItemData, downshift) => {
    const { selectedItems, handleUnStoredItemCb } = this.props;
    let newItem = [newItemData];
    if (isArray(newItemData)) {
      newItem = newItemData;
    }
    const newSelectedItems = [...selectedItems, ...newItem];
    this.handleChange(newSelectedItems, downshift);
    const collectStoredItemsMapCb = (storedItemsMap) =>
      handleUnStoredItemCb && handleUnStoredItemCb(newSelectedItems, storedItemsMap);
    this.collectStoredItemsMap(newItem, collectStoredItemsMapCb);
  };
  editItem = (oldItem, newItem, downshift) => {
    const { selectedItems } = this.props;
    const position = selectedItems.indexOf(oldItem);
    const newValue = [...selectedItems];
    newValue.splice(position, 1, newItem);
    this.handleChange(newValue, downshift);
  };
  removeItem = (removedItem, downshift) => {
    const { selectedItems, handleUnStoredItemCb } = this.props;
    const newSelectedItems = selectedItems.filter((item) => !isEqual(item, removedItem));
    this.handleChange(newSelectedItems, downshift);
    const filterStoredItemsMapCb = (storedItemsMap) =>
      handleUnStoredItemCb && handleUnStoredItemCb(newSelectedItems, storedItemsMap);
    this.filterStoredItemsMap(removedItem, filterStoredItemsMapCb);
  };
  handleSelection = (selectedItem, downshift) => {
    if (!selectedItem) return;
    const { selectedItems } = this.props;
    if (selectedItems.some((item) => isEqual(item, selectedItem))) {
      this.removeItem(selectedItem, downshift);
    } else {
      this.addSelectedItem(selectedItem, downshift);
    }
  };
  getStateAndHelpers(downshift) {
    const { getRemoveButtonProps, removeItem, editItem, handleChange } = this;
    const { storedItemsMap } = this.state;
    return {
      getRemoveButtonProps,
      removeItem,
      editItem,
      handleChange,
      storedItemsMap,
      ...downshift,
    };
  }

  render() {
    const { children, ...props } = this.props;
    return (
      <Downshift
        {...props}
        stateReducer={this.stateReducer}
        onChange={this.handleSelection}
        selectedItem={null}
      >
        {(downshift) => children(this.getStateAndHelpers(downshift))}
      </Downshift>
    );
  }
}
