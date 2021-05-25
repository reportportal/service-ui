/*
 * Copyright 2021 EPAM Systems
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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import classNames from 'classnames/bind';
import { messages } from '../../../../messages';
import { ALL_LOADED_TI_FROM_HISTORY_LINE } from '../../../../constants';
import styles from './itemsListHeader.scss';

const cx = classNames.bind(styles);

export const ItemsListHeader = ({
  testItems,
  setModalState,
  selectedItemsLength,
  selectedItems,
  showErrorLogs,
  onShowErrorLogsChange,
  optionValue,
  rightSectionIsLess,
  isBulkOperation,
}) => {
  const { formatMessage } = useIntl();
  const [isAllSelected, setIsAllSelected] = useState(selectedItems.length === testItems.length);
  useEffect(() => {
    setIsAllSelected(selectedItems.length === testItems.length);
  }, [selectedItems]);

  const onCheckboxChange = () => {
    if (testItems.length === 1) {
      return;
    }
    const isAllSelectedCondition = isBulkOperation ? [] : testItems.slice(0, 1);
    setModalState({
      selectedItems: isAllSelected ? isAllSelectedCondition : testItems,
    });
  };

  return (
    <div className={cx('header-row')}>
      <InputCheckbox value={isAllSelected} onChange={onCheckboxChange} iconTransparentBackground>
        <span className={cx('checkbox-label')}>
          {formatMessage(messages.selectedItemCount, {
            selected: selectedItemsLength,
            total: testItems.length,
          })}
        </span>
      </InputCheckbox>
      {optionValue !== ALL_LOADED_TI_FROM_HISTORY_LINE && (
        <InputSwitcher
          className={cx('switcher', { 'shown-less': rightSectionIsLess })}
          childrenClassName={cx('switcher-children')}
          value={showErrorLogs}
          onChange={onShowErrorLogsChange}
          childrenFirst
          size="medium"
          mode="dark"
        >
          {formatMessage(messages.showErrorLogs)}
        </InputSwitcher>
      )}
    </div>
  );
};
ItemsListHeader.propTypes = {
  testItems: PropTypes.array,
  setModalState: PropTypes.func,
  selectedItemsLength: PropTypes.number,
  selectedItems: PropTypes.array,
  showErrorLogs: PropTypes.bool,
  onShowErrorLogsChange: PropTypes.func,
  optionValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  isBulkOperation: PropTypes.bool,
  rightSectionIsLess: PropTypes.bool,
};
ItemsListHeader.defaultProps = {
  setModalState: () => {},
  selectedItemsLength: 0,
  testItems: [],
  selectedItems: [],
  showErrorLogs: false,
  onShowErrorLogsChange: () => {},
  optionValue: '',
  isBulkOperation: false,
  rightSectionIsLess: true,
};
