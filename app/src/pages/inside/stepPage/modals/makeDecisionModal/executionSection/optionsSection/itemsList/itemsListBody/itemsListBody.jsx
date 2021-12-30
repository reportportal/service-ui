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
import { messages } from '../../../../../makeDecisionModal/messages';
import { TestItemDetails } from '../../../../elements/testItemDetails';
import { CHECKBOX_TEST_ITEM_DETAILS } from '../../../../constants';
import styles from './itemsListBody.scss';

const cx = classNames.bind(styles);

const SimilarItemsList = ({
  testItems,
  selectedItems,
  selectItem,
  eventsInfo,
  onToggleCallback,
}) => {
  return (
    <>
      {testItems.length > 0 &&
        testItems.map((item) => {
          const { itemId, id, itemName, name, issue, patternTemplates } = item;
          const composedItem = {
            ...item,
            id: id || itemId,
            name: name || itemName,
            issue,
            patternTemplates,
          };
          const selected = !!selectedItems.find(
            (selectedItem) => selectedItem.itemId === item.itemId,
          );

          return (
            <div key={item.id || item.itemId}>
              <TestItemDetails
                item={composedItem}
                logs={composedItem.logs}
                selectItem={selectItem}
                isSelected={selected}
                mode={CHECKBOX_TEST_ITEM_DETAILS}
                showErrorLogs={item.opened}
                eventsInfo={eventsInfo}
                onToggleCallback={onToggleCallback}
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
  eventsInfo: PropTypes.object,
  onToggleCallback: PropTypes.func,
};
SimilarItemsList.defaultProps = {
  eventsInfo: {},
  onToggleCallback: () => {},
};

export const ItemsListBody = ({
  currentTestItem,
  testItems,
  selectedItems,
  setItems,
  showErrorLogs,
  eventsInfo,
  onShowErrorLogsChange,
}) => {
  const { trackEvent } = useTracking();
  const defectFromTIGroup = currentTestItem.issue.issueType.startsWith(
    TO_INVESTIGATE_LOCATOR_PREFIX,
  );
  const selectItem = (id) => {
    setItems({
      selectedItems: selectedItems.find((item) => item.id === id)
        ? selectedItems.filter((item) => item.id !== id)
        : [...selectedItems, testItems.find((item) => item.id === id)],
    });
  };
  const onToggleCallback = (id) => {
    const newTestItems = testItems.map((item) =>
      item.id === id ? { ...item, opened: !item.opened } : item,
    );
    setItems({
      testItems: newTestItems,
    });
    onShowErrorLogsChange(newTestItems.every((item) => item.opened === true));
  };
  const onClickExternalLinkEvent = () => {
    const { onClickExternalLink } = eventsInfo;
    onClickExternalLink &&
      trackEvent(
        onClickExternalLink({ defectFromTIGroup, section: messages.applyFor.defaultMessage }),
      );
  };
  const onClickItemEvent = () => {
    const { onClickItem } = eventsInfo;
    onClickItem && trackEvent(onClickItem(defectFromTIGroup, messages.applyFor.defaultMessage));
  };
  const onOpenStackTraceEvent = () => {
    const { onOpenStackTrace } = eventsInfo;
    onOpenStackTrace &&
      trackEvent(onOpenStackTrace(defectFromTIGroup, messages.applyFor.defaultMessage));
  };

  return (
    <div className={cx('items-list')}>
      <SimilarItemsList
        testItems={testItems}
        selectedItems={selectedItems}
        selectItem={selectItem}
        showErrorLogs={showErrorLogs}
        onToggleCallback={onToggleCallback}
        eventsInfo={{
          onOpenStackTraceEvent,
          onClickItemEvent,
          onClickExternalLinkEvent,
        }}
      />
    </div>
  );
};
ItemsListBody.propTypes = {
  currentTestItem: PropTypes.array,
  testItems: PropTypes.array,
  selectedItems: PropTypes.array,
  setItems: PropTypes.func,
  showErrorLogs: PropTypes.bool,
  optionValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  eventsInfo: PropTypes.object,
  onShowErrorLogsChange: PropTypes.func,
};
ItemsListBody.defaultProps = {
  currentTestItem: [],
  testItems: [],
  selectedItems: [],
  setItems: () => {},
  showErrorLogs: false,
  optionValue: '',
  eventsInfo: {},
  onShowErrorLogsChange: () => {},
};
