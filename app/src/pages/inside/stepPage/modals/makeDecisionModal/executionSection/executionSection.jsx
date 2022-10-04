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
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { activeFilterSelector } from 'controllers/filter';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { TestItemDetails } from 'pages/inside/stepPage/modals/makeDecisionModal/elements/testItemDetails';
import { historyItemsSelector } from 'controllers/log';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { activeProjectKeySelector } from 'controllers/user';
import {
  ALL_LOADED_TI_FROM_HISTORY_LINE,
  CURRENT_EXECUTION_ONLY,
  SEARCH_MODES,
  SHOW_LOGS_BY_DEFAULT,
} from '../constants';
import { OptionsSection } from './optionsSection';
import styles from './executionSection.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const ExecutionSection = ({ modalState, setModalState, isBulkOperation, eventsInfo }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const projectKey = useSelector(activeProjectKeySelector);
  const activeFilter = useSelector(activeFilterSelector);
  const [currentItemsLoading, setCurrentItemsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { optionValue, currentTestItems } = modalState;
  const historyItems = useSelector(historyItemsSelector).filter(
    (item) =>
      item.issue &&
      item.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX) &&
      item.id !== currentTestItems[0].id,
  );
  const defectFromTIGroup = isBulkOperation
    ? undefined
    : modalState.currentTestItems[0].issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

  useEffect(() => {
    const itemIds = [];
    currentTestItems.forEach(({ id }) => itemIds.push(id));
    setCurrentItemsLoading(true);
    fetch(URLS.bulkLastLogs(projectKey), {
      method: 'post',
      data: { itemIds, logLevel: 'ERROR' },
    })
      .then((response) => {
        const currentItemsWithLogs = [];
        currentTestItems.forEach((elem) =>
          currentItemsWithLogs.push({ ...elem, logs: response[elem.id], opened: true }),
        );
        setModalState({
          currentTestItems: currentItemsWithLogs,
        });
        setCurrentItemsLoading(false);
      })
      .catch(({ message }) => {
        setCurrentItemsLoading(false);
        dispatch(
          showNotification({
            message,
            type: NOTIFICATION_TYPES.ERROR,
          }),
        );
      });
  }, []);
  useEffect(() => {
    if (optionValue === CURRENT_EXECUTION_ONLY) {
      setModalState({
        testItems: [],
        selectedItems: [],
      });
    } else {
      const { searchMode } = modalState;
      const requestData = {
        searchMode,
      };
      if (searchMode === SEARCH_MODES.WITH_FILTER) {
        requestData.filterId = activeFilter.id;
      }
      setLoading(true);
      const itemIds = [];
      let request;
      if (optionValue === ALL_LOADED_TI_FROM_HISTORY_LINE) {
        historyItems.forEach(({ id }) => itemIds.push(id));
        request = fetch(URLS.bulkLastLogs(projectKey), {
          method: 'post',
          data: { itemIds, logLevel: 'ERROR' },
        });
      }
      if (searchMode) {
        request = fetch(URLS.logSearch(projectKey, currentTestItems[0].id), {
          method: 'post',
          data: requestData,
        });
      }
      request
        .then((response) => {
          const similarItemsWithLogs = [];
          if (optionValue === ALL_LOADED_TI_FROM_HISTORY_LINE) {
            historyItems.forEach((item) =>
              similarItemsWithLogs.push({
                ...item,
                itemId: item.id,
                logs: response[item.id],
                opened: SHOW_LOGS_BY_DEFAULT,
              }),
            );
          } else {
            similarItemsWithLogs.push(
              ...response.map((item) => ({
                ...item,
                id: item.itemId,
                opened: SHOW_LOGS_BY_DEFAULT,
              })),
            );
          }
          setModalState({
            testItems: similarItemsWithLogs,
            selectedItems: [],
          });
          setLoading(false);
        })
        .catch(({ message }) => {
          setModalState({
            testItems: [],
            selectedItems: [],
          });
          setLoading(false);
          dispatch(
            showNotification({
              message,
              type: NOTIFICATION_TYPES.ERROR,
            }),
          );
        });
    }
  }, [optionValue]);

  const onClickItemEvent = () => {
    const { onClickItem } = eventsInfo;
    onClickItem &&
      trackEvent(onClickItem(defectFromTIGroup, messages.executionToChange.defaultMessage));
  };
  const onClickExternalLinkEvent = () => {
    const { onClickExternalLink } = eventsInfo;
    onClickExternalLink &&
      trackEvent(
        onClickExternalLink({
          defectFromTIGroup,
          section: messages.executionToChange.defaultMessage,
        }),
      );
  };
  const onOpenStackTraceEvent = () => {
    const { onOpenStackTrace } = eventsInfo;
    onOpenStackTrace &&
      trackEvent(onOpenStackTrace(defectFromTIGroup, messages.executionToChange.defaultMessage));
  };

  return (
    <>
      <div className={cx('header')}>{formatMessage(messages.executionToChange)}</div>
      {currentTestItems.map((item) => (
        <TestItemDetails
          item={item}
          logs={item.logs}
          showErrorLogs={currentItemsLoading || item.opened}
          loading={currentItemsLoading}
          key={item.id}
          eventsInfo={{
            onOpenStackTraceEvent,
            onClickItemEvent,
            onClickExternalLinkEvent,
            onClickIssueTicketEvent: eventsInfo.onClickIssueTicketEvent,
          }}
        />
      ))}
      {!isBulkOperation && (
        <OptionsSection
          currentTestItem={currentTestItems[0]}
          modalState={modalState}
          setModalState={setModalState}
          eventsInfo={eventsInfo}
          loading={loading}
        />
      )}
    </>
  );
};
ExecutionSection.propTypes = {
  modalState: PropTypes.object,
  setModalState: PropTypes.func,
  isBulkOperation: PropTypes.bool,
  eventsInfo: PropTypes.object,
};
ExecutionSection.defaultProps = {
  modalState: {},
  setModalState: () => {},
  isBulkOperation: false,
  eventsInfo: {},
};
