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
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { SCREEN_SM_MAX, SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { useDispatch } from 'react-redux';
import { TestItemDetails } from '../../elements/testItemDetails';
import { COPY_FROM_HISTORY_LINE, RADIO_TEST_ITEM_DETAILS } from '../../constants';
import styles from './copyFromHistoryLine.scss';

const cx = classNames.bind(styles);

export const CopyFromHistoryLine = ({
  items,
  modalState,
  itemData,
  setModalState,
  windowSize,
  eventsInfo,
  projectKey,
}) => {
  const dispatch = useDispatch();
  const [composedItems, setComposedItems] = useState(items);
  const { trackEvent } = useTracking();

  useEffect(() => {
    const itemIds = items.map((item) => item.id);
    fetch(URLS.bulkLastLogs(projectKey), {
      method: 'post',
      data: { itemIds, logLevel: 'ERROR' },
    })
      .then((resp) => {
        const itemsWithLogs = items.map((item) => {
          return {
            ...item,
            logs: resp[item.id],
          };
        });
        setComposedItems(itemsWithLogs);
      })
      .catch(({ message }) => {
        dispatch(
          showNotification({
            message,
            type: NOTIFICATION_TYPES.ERROR,
          }),
        );
      });
  }, []);

  const source = modalState.historyChoice;
  const defectFromTIGroup = itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

  const selectHistoryLineItem = (itemId) => {
    if (itemId && itemId !== source.id) {
      const historyItem = items.find((item) => item.id === itemId);
      setModalState({
        ...modalState,
        decisionType: COPY_FROM_HISTORY_LINE,
        issueActionType: '',
        historyChoice: historyItem,
      });
    } else {
      setModalState({
        ...modalState,
        decisionType: '',
        historyChoice: { issue: itemData.issue },
      });
    }
  };
  const hideLabels = () => {
    if (!windowSize) return false;
    const { width } = windowSize;
    return width < SCREEN_SM_MAX && width > SCREEN_XS_MAX;
  };
  const onClickExternalLinkEvent = () => {
    trackEvent(eventsInfo.getClickItemLinkEvent(defectFromTIGroup, 'history'));
  };
  const onOpenStackTraceEvent = () => {
    return eventsInfo.getOpenStackTraceEvent(defectFromTIGroup, 'history');
  };

  return (
    <>
      {composedItems.map((item) => (
        <div className={cx('execution-item')} key={item.id}>
          <TestItemDetails
            item={item}
            logs={item.logs}
            selectItem={selectHistoryLineItem}
            isSelected={source.id === item.id}
            hideLabels={hideLabels()}
            mode={RADIO_TEST_ITEM_DETAILS}
            eventsInfo={{
              onOpenStackTraceEvent,
              onClickExternalLinkEvent,
            }}
          />
        </div>
      ))}
    </>
  );
};
CopyFromHistoryLine.propTypes = {
  items: PropTypes.array,
  modalState: PropTypes.object.isRequired,
  itemData: PropTypes.object,
  setModalState: PropTypes.func.isRequired,
  windowSize: PropTypes.object,
  eventsInfo: PropTypes.object,
  projectKey: PropTypes.string.isRequired,
};
CopyFromHistoryLine.defaultProps = {
  items: [],
  windowSize: {},
  eventsInfo: {},
};
