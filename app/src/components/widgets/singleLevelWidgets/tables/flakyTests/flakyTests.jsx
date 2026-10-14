/*
 * Copyright 2026 EPAM Systems
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
import { defineMessages } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { actionToPath, history, selectLocationState } from 'redux-first-router';
import qs from 'qs';
import { testCaseNameLinkSelector } from 'controllers/testItem';
import { activeDashboardIdSelector } from 'controllers/pages';
import { WIDGETS_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './flakyTestsCfg';

const titleMessages = defineMessages({
  flakyTestsMatrixTooltip: {
    id: 'flakyTests.flakyTestsMatrixTooltip',
    defaultMessage: '{statusNumber} {statusChange} from {possibleNumber} {possibleTimes}',
  },
  change: {
    id: 'flakyTests.flakyTestsMatrixTooltipChange',
    defaultMessage: 'status change',
  },
  changes: {
    id: 'flakyTests.flakyTestsMatrixTooltipChanges',
    defaultMessage: 'status changes',
  },
  possible: {
    id: 'flakyTests.flakyTestsMatrixTooltipPossible',
    defaultMessage: 'possible',
  },
  possibleTimes: {
    id: 'flakyTests.flakyTestsMatrixTooltipPossibleTimes',
    defaultMessage: 'possible times',
  },
});

const prepareWidgetData = ({ flaky }) =>
  flaky.map((item) => ({ ...item, statuses: [...item.statuses].reverse() }));

const getMatrixTooltip = (count, total, formatMessage) => {
  return formatMessage(titleMessages.flakyTestsMatrixTooltip, {
    statusNumber: count,
    statusChange: formatMessage(count === 1 ? titleMessages.change : titleMessages.changes),
    possibleTimes: formatMessage(
      total === 1 ? titleMessages.possible : titleMessages.possibleTimes,
    ),
    possibleNumber: total,
  });
};

export const FlakyTests = ({ widget }) => {
  const getTestCaseNameLink = useSelector(testCaseNameLinkSelector);
  const dashboardId = useSelector(activeDashboardIdSelector);
  const location = useSelector(selectLocationState);
  const { routesMap } = location;
  const { trackEvent } = useTracking();

  const itemClickHandler = (row) => {
    const {
      content: { latestLaunch = {} },
    } = widget;
    const uniqueId = row?.uniqueId;
    const launchId = row?.launchId ?? latestLaunch.id;
    if (!uniqueId || launchId == null) {
      return;
    }
    const testItemIds = String(launchId);
    const link = getTestCaseNameLink({ uniqueId, testItemIds });

    trackEvent(WIDGETS_EVENTS.clickOnFlakyTestCaseName(dashboardId));

    const path = actionToPath(link, routesMap, qs);
    const url = history().createHref({ pathname: path });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const { content } = widget;

  return (
    <TestsTableWidget
      tests={prepareWidgetData(content)}
      launch={content.latestLaunch}
      columns={cfg.columns}
      getMatrixTooltip={getMatrixTooltip}
      onItemClick={itemClickHandler}
      opensLinkInNewTab
      passFullRowOnItemClick
      omitLaunchExecutionNumber
    />
  );
};

FlakyTests.propTypes = {
  widget: PropTypes.object.isRequired,
};
