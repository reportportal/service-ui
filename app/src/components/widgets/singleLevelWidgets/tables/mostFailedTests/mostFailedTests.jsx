/*
 * Copyright 2025 EPAM Systems
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

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { actionToPath, history } from 'redux-first-router';
import qs from 'qs';
import { testCaseNameLinkSelector } from 'controllers/testItem';
import { activeDashboardIdSelector } from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import { WIDGETS_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import routesMap from 'routes/routesMap';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './mostFailedTestsCfg';

export const MostFailedTests = ({ widget }) => {
  const activeProject = useSelector(activeProjectSelector);
  const dashboardId = useSelector(activeDashboardIdSelector);
  const { trackEvent } = useTracking();

  const getTestCaseNameLink = useMemo(() => {
    return testCaseNameLinkSelector({ user: { activeProject } });
  }, [activeProject]);

  const getIssueTypeMessage = (issueType) => {
    const type = issueType.split('$')[2];
    return cfg.issueTypes[type];
  };

  const itemClickHandler = (uniqueId) => {
    const {
      content: { result },
    } = widget;
    const launchId = result.find((item) => item.uniqueId === uniqueId)?.launchId;
    const link = getTestCaseNameLink({ uniqueId, testItemIds: launchId });

    trackEvent(WIDGETS_EVENTS.clickOnMostFailedTestCaseName(dashboardId));

    const path = actionToPath(link, routesMap, qs);
    const url = history().createHref({ pathname: path });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const {
    content,
    contentParameters: { contentFields, widgetOptions },
  } = widget;
  const issueType = contentFields[0];

  return (
    <TestsTableWidget
      tests={content.result}
      launch={{ name: widgetOptions.launchNameFilter }}
      issueType={getIssueTypeMessage(issueType)}
      columns={cfg.columns}
      onItemClick={itemClickHandler}
      opensLinkInNewTab={true}
    />
  );
};

MostFailedTests.propTypes = {
  widget: PropTypes.object.isRequired,
};