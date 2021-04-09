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
import { isEmptyObject, uniqueId } from 'common/utils';
import { isNotEmptyArray } from 'common/utils/validation/validate';
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

export const ItemsListBody = ({ testItems, selectedItems, setModalState, showErrorLogs }) => {
  const [currentTestItem, ...restItems] = testItems;
  const selectItem = (id) => {
    setModalState({
      selectedItems: selectedItems.find((item) => item.itemId === id)
        ? selectedItems.filter((item) => item.itemId !== id)
        : [...selectedItems, testItems.find((item) => item.itemId === id)],
    });
  };

  return (
    <>
      {
        <div className={cx('items-list')}>
          {!isEmptyObject(currentTestItem) && (
            <div key={uniqueId()}>
              <ItemHeader item={currentTestItem} preselected />
              {showErrorLogs &&
                currentTestItem.logs.slice(0, 5).map((log) => <Log log={log} key={uniqueId()} />)}
            </div>
          )}
          {isNotEmptyArray(restItems) &&
            restItems.map((item) => {
              const { itemId: id, itemName: name, issue, patternTemplates } = item;
              const composeItem = {
                ...item,
                id,
                name,
                issue,
                patternTemplates,
              };
              const selected =
                selectedItems.find((selectedItem) => selectedItem.itemId === item.itemId) || false;
              return (
                <div key={uniqueId()}>
                  <ItemHeader item={composeItem} selectItem={selectItem} isSelected={!!selected} />
                  {showErrorLogs &&
                    item.logs.slice(0, 5).map((log) => <Log log={log} key={uniqueId()} />)}
                </div>
              );
            })}
        </div>
      }
    </>
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
