/*
 * Copyright 2022 EPAM Systems
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

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { payloadSelector, PROJECT_SETTINGS_TAB_PAGE, projectIdSelector } from 'controllers/pages';
import { Tabs } from 'components/main/tabs';
import classNames from 'classnames/bind';
import { ANALYSIS } from 'common/constants/settingsTabs';
import {
  ANALYZER_ATTRIBUTE_PREFIX,
  analyzerAttributesSelector,
  fetchConfigurationAttributesAction,
  normalizeAttributesWithPrefix,
  updateConfigurationAttributesAction,
} from 'controllers/project';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { showModalAction } from 'controllers/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { analyzerExtensionsSelector } from 'controllers/appInfo';
import { canUpdateSettings } from 'common/utils/permissions';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { messages } from './messages';
import { messages as indexSettingsMessages } from './indexSettings/messages';
import {
  INDEXING_RUNNING,
  AUTO_ANALYSIS,
  INDEX_SETTINGS,
  SIMILAR_ITEMS,
  UNIQUE_ERRORS,
  NUMBER_OF_LOG_LINES,
} from './constants';
import { AutoAnalysis } from './autoAnalysis';
import { IndexSettings } from './indexSettings';
import { SimilarItems } from './similarItems';
import { UniqueErrors } from './uniqueErrors';
import styles from './analyzerContainer.scss';

const cx = classNames.bind(styles);

export const AnalyzerContainer = ({ setHeaderNodes }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectId = useSelector(projectIdSelector);
  const { subTab: activeSubTab } = useSelector(payloadSelector);
  const analyzerConfig = useSelector(analyzerAttributesSelector);
  const analyzerExtensions = useSelector(analyzerExtensionsSelector);
  const accountRole = useSelector(userAccountRoleSelector);
  const userRole = useSelector(activeProjectRoleSelector);
  const isAnalyzerServiceAvailable = !!analyzerExtensions.length;
  const analyzerUnavailableTitle = !isAnalyzerServiceAvailable
    ? formatMessage(COMMON_LOCALE_KEYS.ANALYZER_DISABLED)
    : null;
  const hasPermission = canUpdateSettings(accountRole, userRole);

  useEffect(() => {
    dispatch(fetchConfigurationAttributesAction(projectId));
  }, []);

  const createTabLink = useCallback(
    (subTabName) => ({
      type: PROJECT_SETTINGS_TAB_PAGE,
      payload: { projectId, settingsTab: ANALYSIS, subTab: subTabName },
    }),
    [projectId],
  );

  const indexingRunning = useMemo(() => JSON.parse(analyzerConfig[INDEXING_RUNNING] || 'false'), [
    analyzerConfig,
  ]);

  const checkIfConfirmationNeeded = (data) => {
    const newLogLinesValue = data[NUMBER_OF_LOG_LINES];

    return (
      !indexingRunning &&
      isAnalyzerServiceAvailable &&
      newLogLinesValue &&
      String(newLogLinesValue) !== String(analyzerConfig[NUMBER_OF_LOG_LINES])
    );
  };

  const updateProjectConfig = async (formData) => {
    const isConfirmationNeeded = checkIfConfirmationNeeded(formData);
    const preparedData = normalizeAttributesWithPrefix(formData, ANALYZER_ATTRIBUTE_PREFIX);
    const data = {
      configuration: {
        attributes: {
          ...preparedData,
        },
      },
    };

    try {
      await fetch(URLS.projectByName(projectId), { method: 'put', data });
      dispatch(
        showNotification({
          message: formatMessage(messages.updateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        }),
      );
      dispatch(updateConfigurationAttributesAction(data));

      if (isConfirmationNeeded) {
        dispatch(
          showModalAction({
            id: 'generateIndexModalWindow',
            data: {
              modalTitle: formatMessage(indexSettingsMessages.regenerateIndexTitle),
              modalDescription: formatMessage(indexSettingsMessages.regenerateIndexDescription),
            },
          }),
        );
      }
    } catch (e) {
      dispatch(
        showNotification({
          message: formatMessage(messages.updateErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        }),
      );
    }
  };

  const tabsConfig = useMemo(
    () => ({
      [INDEX_SETTINGS]: {
        name: formatMessage(messages.indexSettings),
        link: createTabLink(INDEX_SETTINGS),
        component: (
          <IndexSettings
            analyzerConfig={analyzerConfig}
            indexingRunning={indexingRunning}
            isAnalyzerServiceAvailable={isAnalyzerServiceAvailable}
            analyzerUnavailableTitle={analyzerUnavailableTitle}
            onFormSubmit={updateProjectConfig}
            hasPermission={hasPermission}
          />
        ),
      },
      [AUTO_ANALYSIS]: {
        name: formatMessage(messages.autoAnalysis),
        link: createTabLink(AUTO_ANALYSIS),
        component: (
          <AutoAnalysis
            analyzerConfig={analyzerConfig}
            onFormSubmit={updateProjectConfig}
            hasPermission={hasPermission}
            isAnalyzerServiceAvailable={isAnalyzerServiceAvailable}
            analyzerUnavailableTitle={analyzerUnavailableTitle}
          />
        ),
      },
      [SIMILAR_ITEMS]: {
        name: formatMessage(messages.similarItems),
        link: createTabLink(SIMILAR_ITEMS),
        component: (
          <SimilarItems
            analyzerConfig={analyzerConfig}
            onFormSubmit={updateProjectConfig}
            hasPermission={hasPermission}
          />
        ),
      },
      [UNIQUE_ERRORS]: {
        name: formatMessage(messages.uniqueErrors),
        link: createTabLink(UNIQUE_ERRORS),
        component: (
          <UniqueErrors
            analyzerConfig={analyzerConfig}
            onFormSubmit={updateProjectConfig}
            hasPermission={hasPermission}
            isAnalyzerServiceAvailable={isAnalyzerServiceAvailable}
            analyzerUnavailableTitle={analyzerUnavailableTitle}
          />
        ),
      },
    }),
    [
      analyzerConfig,
      createTabLink,
      hasPermission,
      analyzerUnavailableTitle,
      isAnalyzerServiceAvailable,
    ],
  );

  useEffect(() => {
    setHeaderNodes(
      <div className={cx('tabs')}>
        <Tabs config={tabsConfig} activeTab={activeSubTab} withContent={false} />
      </div>,
    );

    if (!activeSubTab || !tabsConfig[activeSubTab]) {
      const firstItemName = Object.keys(tabsConfig)[0];
      dispatch(tabsConfig[firstItemName].link);
    }

    return () => setHeaderNodes(null);
  }, [activeSubTab]);

  return activeSubTab ? tabsConfig[activeSubTab].component : null;
};
AnalyzerContainer.propTypes = {
  setHeaderNodes: PropTypes.func.isRequired,
};
