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
const SimilarItemsList = ({ testItems, selectedItems, selectItem, showErrorLogs }) => {
  return (
    <>
      {testItems.length > 0 &&
        testItems.map((item, i) => {
          let composeItem = item;
          if (i !== 0) {
            const { itemId: id, itemName: name, issue, patternTemplates } = item;
            composeItem = {
              ...item,
              id,
              name,
              issue,
              patternTemplates,
            };
          }
          const selected =
            !!selectedItems.find((selectedItem) => selectedItem.itemId === item.itemId) || false;
          return (
            <div key={item.id || item.itemId}>
              <ItemHeader
                item={composeItem}
                selectItem={i !== 0 ? selectItem : undefined}
                isSelected={selected}
                preselected={i === 0}
              />
              {showErrorLogs &&
                item.logs.slice(0, 5).map((log) => <Log log={log} key={uniqueId()} />)}
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
};

export const ItemsListBody = ({ testItems, selectedItems, setModalState, showErrorLogs }) => {
  const selectItem = (id) => {
    setModalState({
      selectedItems: selectedItems.find((item) => item.itemId === id)
        ? selectedItems.filter((item) => item.itemId !== id)
        : [...selectedItems, testItems.find((item) => item.itemId === id)],
    });
  };

  return (
    <div className={cx('items-list')}>
      <SimilarItemsList
        testItems={testItems}
        selectedItems={selectedItems}
        selectItem={selectItem}
        showErrorLogs={showErrorLogs}
      />
    </div>
  );
};
ItemsListBody.propTypes = {
  testItems: PropTypes.array,
  selectedItems: PropTypes.array,
  setModalState: PropTypes.func,
  showErrorLogs: PropTypes.bool,
};
ItemsListBody.defaultProps = {
  testItems: [],
  selectedItems: [],
  setModalState: () => {},
  showErrorLogs: false,
};
