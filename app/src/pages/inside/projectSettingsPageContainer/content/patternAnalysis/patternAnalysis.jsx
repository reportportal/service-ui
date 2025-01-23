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

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPatternAction, patternsSelector } from 'controllers/project';
import { useTracking } from 'react-tracking';
import { getSaveNewPatternEvent, SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { hideModalAction, showModalAction } from 'controllers/modal';
import { STRING_PATTERN } from 'common/constants/patternTypes';
import { useIntl } from 'react-intl';
import { canUpdateSettings } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import PropTypes from 'prop-types';
import { docsReferences } from 'common/utils';
import { SettingsPageContent } from '../settingsPageContent';
import { PatternAnalysisContent } from './patternAnalysisContent';
import { EmptyStatePage } from '../emptyStatePage/';
import { messages } from './messages';

export const PatternAnalysis = ({ setHeaderTitleNode }) => {
  const patterns = useSelector(patternsSelector);
  const userRoles = useSelector(userRolesSelector);

  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const savePattern = (pattern) => {
    trackEvent(
      PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.CLICK_SAVE_PATTERN_ANALYSIS_CREATE_MODAL(
        pattern.type,
        pattern.enabled,
      ),
    );
    trackEvent(getSaveNewPatternEvent(pattern.type));
    dispatch(addPatternAction(pattern));
    dispatch(hideModalAction());
  };
  const onAddPattern = () => {
    trackEvent(PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.CLICK_CREATE_PATTERN_ANALYSIS);
    trackEvent(SETTINGS_PAGE_EVENTS.CREATE_PATTERN_BTN);
    dispatch(
      showModalAction({
        id: 'createPatternAnalysisModal',
        data: {
          onSave: savePattern,
          pattern: {
            type: STRING_PATTERN,
            enabled: true,
          },
          patterns,
          isNewPattern: true,
        },
      }),
    );
  };

  const isAbleToCreate = canUpdateSettings(userRoles);

  const handleDocumentationClick = () => {
    trackEvent(
      PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.clickDocumentationLink('no_pattern_analysis'),
    );
  };

  return (
    <>
      {patterns.length > 0 ? (
        <SettingsPageContent>
          <PatternAnalysisContent
            setHeaderTitleNode={setHeaderTitleNode}
            onAddPattern={onAddPattern}
            patterns={patterns}
            disabled={!isAbleToCreate}
          />
        </SettingsPageContent>
      ) : (
        <EmptyStatePage
          title={formatMessage(
            isAbleToCreate ? messages.noPatternAnalysisTitle : messages.noPatternsYetTitle,
          )}
          description={formatMessage(
            isAbleToCreate
              ? messages.noPatternAnalysisDescription
              : messages.noPatternsAppearDescription,
          )}
          buttonName={isAbleToCreate && formatMessage(messages.create)}
          buttonDataAutomationId="createPatternButton"
          documentationLink={docsReferences.emptyStatePatternAnalysisDocs}
          handleButton={onAddPattern}
          handleDocumentationClick={handleDocumentationClick}
        />
      )}
    </>
  );
};
PatternAnalysis.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
};
