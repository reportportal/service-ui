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
import { Accordion, useAccordionTabsState } from 'pages/inside/common/accordion';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { useDispatch, useSelector } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { activeFilterSelector } from 'controllers/filter';
import { messages } from './../../messages';
import { OptionsSection } from './optionsSection';
import { SourceDetails } from './sourceDetails';
import {
  ALL_LOADED_TI_FROM_HISTORY_LINE,
  ERROR_LOGS_SIZE,
  SEARCH_MODES,
  SOURCE_DETAILS,
} from '../../constants';

export const OptionsStepForm = ({ currentTestItem, modalState, setModalState }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const activeFilter = useSelector(activeFilterSelector);
  const [tab, toggleTab] = useAccordionTabsState({
    [SOURCE_DETAILS]: true,
  });
  const [loading, setLoading] = useState(false);
  const { source, optionValue, testItems, selectedItems, issueActionType } = modalState;
  useEffect(() => {
    const fetchLogs = (searchMode) => {
      const requestData = {
        searchMode,
      };
      if (searchMode === SEARCH_MODES.WITH_FILTER) {
        requestData.filterId = activeFilter.id;
      }
      setLoading(true);
      const currentItemLogRequest = fetch(
        URLS.logItemStackTrace(activeProject, currentTestItem.path, ERROR_LOGS_SIZE),
      );
      const similarItemsRequest =
        searchMode &&
        fetch(URLS.logSearch(activeProject, currentTestItem.id), {
          method: 'post',
          data: requestData,
        });
      const requests = searchMode
        ? [currentItemLogRequest, similarItemsRequest]
        : [currentItemLogRequest];
      Promise.all(requests)
        .then((responses) => {
          const [currentItemRes, similarItemsRes] = responses;
          const currentItemLogs = currentItemRes.content;
          const items = [{ ...currentTestItem, logs: currentItemLogs }, ...(similarItemsRes || [])];
          setModalState({
            testItems: items,
            selectedItems: items,
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
    };

    optionValue !== ALL_LOADED_TI_FROM_HISTORY_LINE && fetchLogs(modalState.searchMode);
  }, [optionValue]);

  const tabsData = [
    {
      id: SOURCE_DETAILS,
      shouldShow: true,
      isOpen: tab[SOURCE_DETAILS],
      title: formatMessage(messages.sourceDetails),
      content: <SourceDetails info={source} issueActionType={issueActionType} />,
    },
  ];

  return (
    <>
      <Accordion tabs={tabsData} toggleTab={toggleTab} />
      <OptionsSection
        currentTestItem={currentTestItem}
        setModalState={setModalState}
        testItems={testItems}
        selectedItems={selectedItems}
        optionValue={optionValue}
        loading={loading}
      />
    </>
  );
};
OptionsStepForm.propTypes = {
  currentTestItem: PropTypes.object,
  modalState: PropTypes.object,
  setModalState: PropTypes.func,
};
OptionsStepForm.defaultProps = {
  currentTestItem: {},
  modalState: {},
  setModalState: () => {},
};
