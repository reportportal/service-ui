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

import React from 'react';
import PropTypes from 'prop-types';
import { ItemHeader } from 'pages/inside/logsPage/defectEditor/itemHeader';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import classNames from 'classnames/bind';
import { uniqueId } from 'common/utils';
import { ExecutionInfo } from 'pages/inside/logsPage/defectEditor/executionInfo';
import { ALL_LOADED_TI_FROM_HISTORY_LINE, ERROR_LOGS_SIZE } from '../../../../constants';
import styles from './itemsListBody.scss';

const cx = classNames.bind(styles);

const Log = ({ log }) => (
  <div className={cx('error-log')}>
    <StackTraceMessageBlock level={log.level} designMode="dark" maxHeight={70}>
      <div>{log.message}</div>
    </StackTraceMessageBlock>
  </div>
);
Log.propTypes = {
  log: PropTypes.object.isRequired,
};
const SimilarItemsList = ({
  testItems,
  selectedItems,
  selectItem,
  showErrorLogs,
  isShownLess,
  isBulkOperation,
}) => {
  return (
    <>
      {testItems.length > 0 &&
        testItems.map((item, i) => {
          let composedItem = item;
          if (!isBulkOperation && i !== 0) {
            const { itemId: id, itemName: name, issue, patternTemplates } = item;
            composedItem = {
              ...item,
              id,
              name,
              issue,
              patternTemplates,
            };
          }
          const selected = !!selectedItems.find((selectedItem) =>
            isBulkOperation ? selectedItem.id === item.id : selectedItem.itemId === item.itemId,
          );
          const setSelectItem = () => {
            if (isBulkOperation) {
              return selectItem;
            }
            return i !== 0 ? selectItem : undefined;
          };
          return (
            <div key={item.id || item.itemId}>
              <ItemHeader
                item={composedItem}
                selectItem={setSelectItem()}
                isSelected={selected}
                preselected={!isBulkOperation ? i === 0 : null}
                isShownLess={isShownLess}
              />
              {showErrorLogs &&
                !isShownLess &&
                item.logs
                  .slice(0, ERROR_LOGS_SIZE)
                  .map((log) => <Log log={log} key={uniqueId()} />)}
            </div>
          );
        })}
    </>
  );
};
SimilarItemsList.propTypes = {
  testItems: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  selectItem: PropTypes.func.isRequired,
  showErrorLogs: PropTypes.bool.isRequired,
  isBulkOperation: PropTypes.bool,
  isShownLess: PropTypes.bool,
};

const HistoryLineItemsList = ({ testItems, selectedItems, selectItem, isShownLess }) => {
  return (
    testItems.length > 0 &&
    testItems.map((item, i) => (
      <ExecutionInfo
        item={item}
        selectItem={i !== 0 ? selectItem : undefined}
        isSelected={!!selectedItems.find((selectedItem) => selectedItem.id === item.id)}
        preselected={i === 0}
        key={item.id}
        isShownLess={isShownLess}
      />
    ))
  );
};
HistoryLineItemsList.propTypes = {
  testItems: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  selectItem: PropTypes.func.isRequired,
};

export const ItemsListBody = ({
  testItems,
  selectedItems,
  setModalState,
  showErrorLogs,
  optionValue,
  isShownLess,
  isBulkOperation,
}) => {
  const selectItem = (id) => {
    isBulkOperation
      ? setModalState({
          selectedItems: selectedItems.find((item) => item.id === id)
            ? selectedItems.filter((item) => item.id !== id)
            : [...selectedItems, testItems.find((item) => item.id === id)],
        })
      : setModalState({
          selectedItems: selectedItems.find((item) => item.itemId === id)
            ? selectedItems.filter((item) => item.itemId !== id)
            : [...selectedItems, testItems.find((item) => item.itemId === id)],
        });
  };

  return (
    <div className={cx('items-list')}>
      {optionValue === ALL_LOADED_TI_FROM_HISTORY_LINE ? (
        <HistoryLineItemsList
          testItems={testItems}
          selectedItems={selectedItems}
          selectItem={selectItem}
          isShownLess={isShownLess}
        />
      ) : (
        <SimilarItemsList
          testItems={testItems}
          selectedItems={selectedItems}
          selectItem={selectItem}
          showErrorLogs={showErrorLogs}
          isShownLess={isShownLess}
          isBulkOperation={isBulkOperation}
        />
      )}
    </div>
  );
};
ItemsListBody.propTypes = {
  testItems: PropTypes.array,
  selectedItems: PropTypes.array,
  setModalState: PropTypes.func,
  showErrorLogs: PropTypes.bool,
  optionValue: PropTypes.string,
  isBulkOperation: PropTypes.bool,
  isShownLess: PropTypes.bool,
};
ItemsListBody.defaultProps = {
  testItems: [],
  selectedItems: [],
  setModalState: () => {},
  showErrorLogs: false,
  optionValue: '',
  isBulkOperation: false,
  isShownLess: true,
};
