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
import { useIntl } from 'react-intl';
import { TestItemDetails } from '../../../elements/testItemDetails';
import { messages } from '../../../messages';
import { ALL_LOADED_TI_FROM_HISTORY_LINE, CHECKBOX_TEST_ITEM_DETAILS } from '../../../constants';
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
  noLogsMessage,
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
                mode={CHECKBOX_TEST_ITEM_DETAILS}
                showErrorLogs={showErrorLogs}
                eventsInfo={eventsInfo}
                noLogsMessage={noLogsMessage}
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
  noLogsMessage: PropTypes.string,
};
SimilarItemsList.defaultProps = {
  onClickExternalLinkEvent: () => {},
  eventsInfo: {},
  noLogsMessage: '',
};

const HistoryLineItemsList = ({
  testItems,
  selectedItems,
  selectItem,
  onClickExternalLinkEvent,
  noLogsMessage,
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
          mode={CHECKBOX_TEST_ITEM_DETAILS}
          noLogsMessage={noLogsMessage}
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
  noLogsMessage: PropTypes.string,
};
HistoryLineItemsList.defaultProps = {
  onClickExternalLinkEvent: () => {},
  noLogsMessage: '',
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
  const { formatMessage } = useIntl();
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

  const noLogsMessage = formatMessage(messages.noLogs);

  return (
    <div className={cx('items-list')}>
      {optionValue === ALL_LOADED_TI_FROM_HISTORY_LINE ? (
        <HistoryLineItemsList
          testItems={testItems}
          selectedItems={selectedItems}
          selectItem={selectItem}
          onClickExternalLinkEvent={onClickExternalLinkEvent}
          noLogsMessage={noLogsMessage}
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
          noLogsMessage={noLogsMessage}
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
