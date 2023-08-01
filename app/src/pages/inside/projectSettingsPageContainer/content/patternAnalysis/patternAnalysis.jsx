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
import { hideModalAction, showModalAction } from 'controllers/modal';
import { STRING_PATTERN } from 'common/constants/patternTypes';
import { useIntl } from 'react-intl';
import { canUpdateSettings } from 'common/utils/permissions';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import PropTypes from 'prop-types';
import { referenceDictionary } from 'common/utils';
import { SettingsPageContent } from '../settingsPageContent';
import { PatternAnalysisContent } from './patternAnalysisContent';
import { EmptyStatePage } from '../emptyStatePage/';
import { messages } from './messages';

export const PatternAnalysis = ({ setHeaderTitleNode }) => {
  const patterns = useSelector(patternsSelector);
  const userRole = useSelector(userAccountRoleSelector);
  const projectRole = useSelector(activeProjectRoleSelector);

  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const savePattern = (pattern) => {
    trackEvent(getSaveNewPatternEvent(pattern.type));
    dispatch(addPatternAction(pattern));
    dispatch(hideModalAction());
  };
  const onAddPattern = () => {
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

  const isAbleToCreate = canUpdateSettings(userRole, projectRole);

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
          title={formatMessage(messages.noPatternAnalysisTitle)}
          description={formatMessage(messages.noPatternAnalysisDescription)}
          buttonName={formatMessage(messages.create)}
          buttonDataAutomationId="createPatternButton"
          documentationLink={referenceDictionary.emptyStatePatternAnalysisDocs}
          disableButton={!isAbleToCreate}
          handleButton={onAddPattern}
        />
      )}
    </>
  );
};
PatternAnalysis.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
};
