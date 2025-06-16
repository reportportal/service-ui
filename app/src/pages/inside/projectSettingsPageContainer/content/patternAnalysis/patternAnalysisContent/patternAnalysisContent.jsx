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

import React, { useEffect } from 'react';
import { useTracking } from 'react-tracking';
import { useDispatch, useSelector } from 'react-redux';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  addPatternAction,
  deletePatternAction,
  PAStateSelector,
  updatePAStateAction,
  updatePatternAction,
} from 'controllers/project';
import { hideModalAction, showModalAction } from 'controllers/modal';
import { useIntl } from 'react-intl';
import { Button, Checkbox } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import BinIcon from 'common/img/newIcons/bin-inline.svg';
import CopyIcon from 'common/img/newIcons/copy-inline.svg';
import { docsReferences, createExternalLink } from 'common/utils';
import { PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { canUpdateSettings } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { PatternRuleContent, FieldElement, RuleList, FormattedDescription } from '../../elements';
import { Layout } from '../../layout';
import { messages } from '../messages';
import styles from './patternAnalysisContent.scss';

const cx = classNames.bind(styles);
const COPY_POSTFIX = '_copy';

export function PatternAnalysisContent({ setHeaderTitleNode, onAddPattern, patterns, disabled }) {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const PAState = useSelector(PAStateSelector);
  const userRoles = useSelector(userRolesSelector);
  const canCreatePattern = canUpdateSettings(userRoles);

  useEffect(() => {
    setHeaderTitleNode(
      <>
        {canCreatePattern && (
          <span className={cx('button')} onClick={onAddPattern}>
            <Button disabled={disabled} data-automation-id="createPatternButton">
              {formatMessage(messages.create)}
            </Button>
          </span>
        )}
      </>,
    );

    return () => setHeaderTitleNode(null);
  });

  const onRenamePattern = (pattern) => {
    trackEvent(
      PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.CLICK_ACTION_ICON_PATTERN_ANALYSIS('icon_edit'),
    );
    trackEvent(SETTINGS_PAGE_EVENTS.EDIT_PATTERN_ICON);
    dispatch(
      showModalAction({
        id: 'editPatternModalWindow',
        data: {
          onSave: (dataToSave) => dispatch(updatePatternAction(dataToSave)),
          pattern,
          patterns,
        },
      }),
    );
  };
  const handleSaveClonedPattern = (pattern) => {
    const IS_DUPLICATE_MODAL = true;
    trackEvent(
      PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.CLICK_SAVE_PATTERN_ANALYSIS_CREATE_MODAL(
        pattern.type,
        pattern.enabled,
        IS_DUPLICATE_MODAL,
      ),
    );
    trackEvent(SETTINGS_PAGE_EVENTS.SAVE_BTN_CLONE_PATTERN_MODAL);
    dispatch(addPatternAction(pattern));
    dispatch(hideModalAction());
  };
  const onClonePattern = (pattern) => {
    trackEvent(
      PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.CLICK_ACTION_ICON_PATTERN_ANALYSIS('icon_duplicate'),
    );
    trackEvent(SETTINGS_PAGE_EVENTS.CLONE_PATTERN_ICON);
    const newPattern = {
      ...pattern,
      name: pattern.name + COPY_POSTFIX,
    };
    delete newPattern.id;
    dispatch(
      showModalAction({
        id: 'createPatternAnalysisModal',
        data: {
          onSave: handleSaveClonedPattern,
          pattern: newPattern,
          patterns,
          modalTitle: formatMessage(messages.duplicate),
        },
      }),
    );
  };
  const onDeletePattern = (pattern) => {
    trackEvent(SETTINGS_PAGE_EVENTS.DELETE_PATTERN_ICON);
    dispatch(deletePatternAction(pattern));
    dispatch(hideModalAction());
  };
  const showDeleteConfirmationDialog = (pattern) => {
    trackEvent(
      PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.CLICK_ACTION_ICON_PATTERN_ANALYSIS('icon_delete'),
    );
    dispatch(
      showModalAction({
        id: 'deletePatternRuleModal',
        data: {
          onDelete: () => onDeletePattern(pattern),
        },
      }),
    );
  };
  const onChangePatternAnalysis = (enabled) => {
    trackEvent(PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.SWITCH_AUTO_PATTERN_ANALYSIS(enabled));
    trackEvent(
      enabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_PA_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_PA_SWITCHER,
    );
    dispatch(updatePAStateAction(enabled));
  };
  const onToggleHandler = (enabled, pattern) => {
    trackEvent(PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.SWITCH_NAME_PATTERN_ANALYSIS(enabled));
    trackEvent(
      enabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_PA_RULE_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_PA_RULE_SWITCHER,
    );
    dispatch(
      updatePatternAction({
        ...pattern,
        enabled,
      }),
    );
  };
  const actions = [
    {
      icon: CopyIcon,
      handler: onClonePattern,
      dataAutomationId: 'duplicatePatternIcon',
    },
    {
      icon: PencilIcon,
      handler: onRenamePattern,
      dataAutomationId: 'editPatternIcon',
    },
    {
      icon: BinIcon,
      handler: showDeleteConfirmationDialog,
      dataAutomationId: 'deletePatternIcon',
    },
  ];

  const handleRuleItemClick = (isShown) => {
    if (isShown) {
      trackEvent(PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.OPEN_NAME_PATTERN_ANALYSIS);
    }
  };

  return (
    <>
      <Layout
        description={
          <FormattedDescription
            content={formatMessage(messages.tabDescription, {
              a: (data) => createExternalLink(data, docsReferences.patternAnalysisDocs),
            })}
            event={PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS.clickDocumentationLink()}
          />
        }
      >
        <FieldElement
          withoutProvider
          description={formatMessage(messages.autoPatternAnalysisDescription)}
          dataAutomationId="patternEnabledCheckbox"
        >
          <Checkbox
            disabled={disabled}
            value={PAState}
            onChange={(e) => onChangePatternAnalysis(e.target.checked)}
          >
            {formatMessage(messages.autoPatternAnalysis)}
          </Checkbox>
        </FieldElement>
      </Layout>
      <div className={cx('pattern-container')}>
        <RuleList
          disabled={disabled}
          data={patterns}
          actions={actions}
          onToggle={onToggleHandler}
          ruleItemContent={PatternRuleContent}
          dataAutomationId="patternsList"
          handleRuleItemClick={handleRuleItemClick}
        />
      </div>
    </>
  );
}
PatternAnalysisContent.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
  onAddPattern: PropTypes.func.isRequired,
  patterns: PropTypes.array,
  disabled: PropTypes.bool,
};
PatternAnalysisContent.defaultProps = {
  patterns: [],
  disabled: false,
};
