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
import { useTracking } from 'react-tracking';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import classNames from 'classnames/bind';
import { uniqueId } from 'common/utils';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { ItemHeader } from '../../../elements/itemHeader';
import { ExecutionInfo } from '../../../elements/executionInfo';
import { ALL_LOADED_TI_FROM_HISTORY_LINE, ERROR_LOGS_SIZE } from '../../../constants';
import styles from './itemsListBody.scss';

const cx = classNames.bind(styles);

const Log = ({ log, eventsInfo }) => (
  <div className={cx('error-log')}>
    <StackTraceMessageBlock
      level={log.level}
      designMode="dark"
      maxHeight={70}
      eventsInfo={eventsInfo}
    >
      <div>{log.message}</div>
    </StackTraceMessageBlock>
  </div>
);
Log.propTypes = {
  log: PropTypes.object.isRequired,
  eventsInfo: PropTypes.object,
};
Log.defaultProps = {
  eventsInfo: {},
};

const SimilarItemsList = ({
  testItems,
  selectedItems,
  selectItem,
  showErrorLogs,
  isNarrowView,
  isBulkOperation,
  eventsInfo,
}) => {
  const { trackEvent } = useTracking();
  const isTIGroupDefect = testItems[0].issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);
  const onClickExternalLinkEvent = () => {
    const { onClickExternalLink } = eventsInfo;
    trackEvent(onClickExternalLink(isTIGroupDefect));
  };

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
          const selected = !!selectedItems.find(
            (selectedItem) => selectedItem.itemId === item.itemId,
          );
          const getSelectedItem = () => {
            if (isBulkOperation) {
              return selectItem;
            }
            return i !== 0 ? selectItem : undefined;
          };

          return (
            <div key={item.id || item.itemId}>
              <ItemHeader
                item={composedItem}
                selectItem={getSelectedItem()}
                isSelected={selected}
                preselected={!isBulkOperation ? i === 0 : null}
                isNarrowView={isNarrowView}
                onClickLinkEvent={onClickExternalLinkEvent}
              />
              {showErrorLogs &&
                !isNarrowView &&
                item.logs.slice(0, ERROR_LOGS_SIZE).map((log) => (
                  <Log
                    log={log}
                    key={uniqueId()}
                    eventsInfo={{
                      onOpenStackTraceEvent: () => eventsInfo.onOpenStackTrace(isTIGroupDefect),
                    }}
                  />
                ))}
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
  isNarrowView: PropTypes.bool,
  eventsInfo: PropTypes.object,
};
SimilarItemsList.defaultProps = {
  isNarrowView: false,
  eventsInfo: {},
};

const HistoryLineItemsList = ({
  testItems,
  selectedItems,
  selectItem,
  isNarrowView,
  eventsInfo,
}) => {
  const { trackEvent } = useTracking();
  const onClickExternalLinkEvent = () => {
    const isTIGroupDefect = testItems[0].issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);
    const { onClickExternalLink } = eventsInfo;
    trackEvent(onClickExternalLink(isTIGroupDefect));
  };

  return (
    testItems.length > 0 &&
    testItems.map((item, i) => {
      return (
        <ExecutionInfo
          item={item}
          selectItem={i !== 0 ? selectItem : undefined}
          isSelected={!!selectedItems.find((selectedItem) => selectedItem.id === item.id)}
          preselected={i === 0}
          key={item.id}
          isNarrowView={isNarrowView}
          onClickLinkEvent={onClickExternalLinkEvent}
        />
      );
    })
  );
};
HistoryLineItemsList.propTypes = {
  testItems: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  selectItem: PropTypes.func.isRequired,
  eventsInfo: PropTypes.object,
};
HistoryLineItemsList.defaultProps = {
  eventsInfo: {},
};

export const ItemsListBody = ({
  testItems,
  selectedItems,
  setItems,
  showErrorLogs,
  optionValue,
  isNarrowView,
  isBulkOperation,
  eventsInfo,
}) => {
  const selectItem = (id) => {
    setItems({
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
          isNarrowView={isNarrowView}
          eventsInfo={eventsInfo}
        />
      ) : (
        <SimilarItemsList
          testItems={testItems}
          selectedItems={selectedItems}
          selectItem={selectItem}
          showErrorLogs={showErrorLogs}
          isNarrowView={isNarrowView}
          isBulkOperation={isBulkOperation}
          eventsInfo={eventsInfo}
        />
      )}
    </div>
  );
};
ItemsListBody.propTypes = {
  testItems: PropTypes.array,
  selectedItems: PropTypes.array,
  setItems: PropTypes.func,
  showErrorLogs: PropTypes.bool,
  optionValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  isBulkOperation: PropTypes.bool,
  isNarrowView: PropTypes.bool,
  eventsInfo: PropTypes.object,
};
ItemsListBody.defaultProps = {
  testItems: [],
  selectedItems: [],
  setItems: () => {},
  showErrorLogs: false,
  optionValue: '',
  isBulkOperation: false,
  isNarrowView: true,
  eventsInfo: {},
};
