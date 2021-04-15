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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Accordion, useAccordionTabsState } from 'pages/inside/common/accordion';
import { URLS } from 'common/urls';
import { ERROR } from 'common/constants/logLevels';
import { fetch } from 'common/utils';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { useDispatch, useSelector } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { activeFilterSelector } from 'controllers/filter';
import { messages } from './../../messages';
import { OptionsSection } from './optionsSection';
import { SourceDetails } from './sourceDetails';
import { SEARCH_MODES, SOURCE_DETAILS } from '../../constants';

export const OptionsStepForm = ({ currentTestItem, modalState, setModalState }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const activeFilter = useSelector(activeFilterSelector);
  const [tab, toggleTab, collapseTabsExceptCurr] = useAccordionTabsState({
    [SOURCE_DETAILS]: true,
  });
  const { source, optionValue, loading, testItems, selectedItems } = modalState;
  useEffect(() => {
    const fetchLogs = (searchMode) => {
      const requestData = {
        searchMode,
      };
      if (searchMode === SEARCH_MODES.WITH_FILTER) {
        requestData.filterId = activeFilter.id;
      }
      setModalState({
        loading: true,
      });
      const currentItemLogRequest = fetch(URLS.logItems(activeProject, currentTestItem.id, ERROR));
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
          const similarItems = [];
          if ([SEARCH_MODES.LAST_TEN_LAUNCHES, SEARCH_MODES.WITH_FILTER].includes(searchMode)) {
            const launches = new Set();
            for (let i = 0; i < similarItemsRes.length; i += 1) {
              launches.add(similarItemsRes[i].launchId);
              similarItems.push(similarItemsRes[i]);
              if (launches.size === 10) {
                break;
              }
            }
          }
          const items = [{ ...currentTestItem, logs: currentItemLogs }, ...similarItems];
          setModalState({
            loading: false,
            testItems: items,
            selectedItems: items,
          });
        })
        .catch(({ message }) => {
          setModalState({
            loading: false,
            testItems: [],
            selectedItems: [],
          });
          dispatch(
            showNotification({
              message,
              type: NOTIFICATION_TYPES.ERROR,
            }),
          );
        });
    };

    fetchLogs(modalState.searchMode);
  }, [optionValue]);

  const tabsData = [
    {
      id: SOURCE_DETAILS,
      shouldShow: true,
      isOpen: tab[SOURCE_DETAILS],
      title: formatMessage(messages.sourceDetails),
      content: <SourceDetails info={source} />,
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
        collapseTabsExceptCurr={collapseTabsExceptCurr}
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
