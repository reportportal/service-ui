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
import classNames from 'classnames/bind';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { TestItemDetails } from 'pages/inside/stepPage/modals/makeDecisionModal/elements/testItemDetails';
import {
  ALL_LOADED_TI_FROM_HISTORY_LINE,
  HISTORY_LINE_ITEM,
  SIMILAR_TO_INVESTIGATE_ITEM,
} from '../../../constants';
import styles from './itemsListBody.scss';

const cx = classNames.bind(styles);

const SimilarItemsList = ({
  testItems,
  selectedItems,
  selectItem,
  isBulkOperation,
  onClickExternalLinkEvent,
  showErrorLogs,
  eventsInfo,
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
              <TestItemDetails
                item={composedItem}
                logs={composedItem.logs}
                selectItem={getSelectedItem()}
                isSelected={selected}
                onClickLinkEvent={onClickExternalLinkEvent}
                mode={SIMILAR_TO_INVESTIGATE_ITEM}
                showErrorLogs={showErrorLogs}
                eventsInfo={eventsInfo}
              />
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
  onClickExternalLinkEvent: PropTypes.func,
  eventsInfo: PropTypes.object,
};
SimilarItemsList.defaultProps = {
  onClickExternalLinkEvent: () => {},
  eventsInfo: {},
};

const HistoryLineItemsList = ({
  testItems,
  selectedItems,
  selectItem,
  onClickExternalLinkEvent,
}) => {
  return (
    testItems.length > 0 &&
    testItems.map((item, i) => {
      return (
        <TestItemDetails
          item={item}
          selectItem={i !== 0 ? selectItem : undefined}
          isSelected={!!selectedItems.find((selectedItem) => selectedItem.id === item.id)}
          key={item.id}
          onClickLinkEvent={onClickExternalLinkEvent}
          mode={HISTORY_LINE_ITEM}
        />
      );
    })
  );
};
HistoryLineItemsList.propTypes = {
  testItems: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  selectItem: PropTypes.func.isRequired,
  onClickExternalLinkEvent: PropTypes.func,
};
HistoryLineItemsList.defaultProps = {
  onClickExternalLinkEvent: () => {},
};

export const ItemsListBody = ({
  testItems,
  selectedItems,
  setItems,
  showErrorLogs,
  optionValue,
  isBulkOperation,
  eventsInfo,
}) => {
  const { trackEvent } = useTracking();
  const selectItem = (id) => {
    setItems({
      selectedItems: selectedItems.find((item) => item.itemId === id)
        ? selectedItems.filter((item) => item.itemId !== id)
        : [...selectedItems, testItems.find((item) => item.itemId === id)],
    });
  };
  const onClickExternalLinkEvent = () => {
    const { onClickExternalLink } = eventsInfo;
    const args = {
      isTIGroup: testItems[0].issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX),
    };
    onClickExternalLink && trackEvent(onClickExternalLink(args));
  };

  return (
    <div className={cx('items-list')}>
      {optionValue === ALL_LOADED_TI_FROM_HISTORY_LINE ? (
        <HistoryLineItemsList
          testItems={testItems}
          selectedItems={selectedItems}
          selectItem={selectItem}
          onClickExternalLinkEvent={onClickExternalLinkEvent}
        />
      ) : (
        <SimilarItemsList
          testItems={testItems}
          selectedItems={selectedItems}
          selectItem={selectItem}
          showErrorLogs={showErrorLogs}
          isBulkOperation={isBulkOperation}
          eventsInfo={eventsInfo}
          onClickExternalLinkEvent={onClickExternalLinkEvent}
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
  eventsInfo: PropTypes.object,
};
ItemsListBody.defaultProps = {
  testItems: [],
  selectedItems: [],
  setItems: () => {},
  showErrorLogs: false,
  optionValue: '',
  isBulkOperation: false,
  eventsInfo: {},
};
