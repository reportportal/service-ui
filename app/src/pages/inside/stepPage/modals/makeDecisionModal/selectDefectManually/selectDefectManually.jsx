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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { actionMessages } from 'common/constants/localization/eventsLocalization';
import { LINK_ISSUE, POST_ISSUE, UNLINK_ISSUE } from 'common/constants/actionTypes';
import PlusIcon from 'common/img/plus-button-inline.svg';
import UnlinkIcon from 'common/img/unlink-inline.svg';
import {
  availableBtsIntegrationsSelector,
  enabledBtsPluginsSelector,
  isBtsPluginsExistSelector,
  isPostIssueActionAvailable,
} from 'controllers/plugins';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { MarkdownEditor } from 'components/main/markdown';
import { getIssueTitle } from 'pages/inside/common/utils';
import { DefectTypeSelector } from 'pages/inside/common/defectTypeSelector';
import { debugModeSelector } from 'controllers/launch';
import { SELECT_DEFECT_MANUALLY } from '../constants';
import { messages } from '../messages';
import { ActionButtonsBar } from './actionButtonsBar';
import styles from './selectDefectManually.scss';

const cx = classNames.bind(styles);

const BREAKPOINTS = {
  HIDE_IGNORE_AA: 810,
  SCREEN_XS_MAX: 767,
  SHORT_DEFECT_TYPE_FULL_VIEW: 1300,
  SHORT_DEFECT_TYPE_NARROW_VIEW: 1100,
  SHORT_MSG_FULL_VIEW: 1024,
  SHORT_MSG_NARROW_VIEW: 880,
};

export const SelectDefectManually = ({
  modalState,
  itemData,
  isBulkOperation,
  setModalState,
  collapseTabsExceptCurr,
  windowSize,
  collapsedRightSection,
}) => {
  const { formatMessage } = useIntl();
  const btsIntegrations = useSelector(availableBtsIntegrationsSelector);
  const isBtsPluginsExist = useSelector(isBtsPluginsExistSelector);
  const enabledBtsPlugins = useSelector(enabledBtsPluginsSelector);
  const debugMode = useSelector(debugModeSelector);
  const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);
  const [commentEditor, setCommentEditor] = useState(null);

  const handleManualChange = (value = {}) => {
    const issue = {
      ...(modalState.decisionType === SELECT_DEFECT_MANUALLY
        ? modalState.source.issue
        : itemData.issue),
      ...value,
    };
    setModalState({
      ...modalState,
      source: { issue },
      decisionType: SELECT_DEFECT_MANUALLY,
    });
    collapseTabsExceptCurr(SELECT_DEFECT_MANUALLY);
    !issue.comment && commentEditor.focus();
  };

  const selectDefectTypeManually = (value) => {
    handleManualChange({ issueType: value });
  };
  const handleIgnoreAnalyzerChange = (value) => {
    handleManualChange({ ignoreAnalyzer: value });
  };
  const handleDefectCommentChange = (value) => {
    handleManualChange({ comment: value });
  };

  const getActionItems = () => {
    const issueTitle = getIssueTitle(
      formatMessage,
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      isPostIssueUnavailable,
    );
    const setIssueActionType = (issueActionType) => {
      if (modalState.issueActionType === issueActionType) {
        setModalState({
          ...modalState,
          issueActionType: '',
        });
      } else {
        setModalState(
          modalState.decisionType === SELECT_DEFECT_MANUALLY
            ? {
                ...modalState,
                issueActionType,
              }
            : {
                ...modalState,
                source: { issue: itemData.issue },
                decisionType: SELECT_DEFECT_MANUALLY,
                issueActionType,
              },
        );
      }
    };
    const actionButtonItems = [
      {
        id: POST_ISSUE,
        label: formatMessage(actionMessages[POST_ISSUE]),
        hint: isPostIssueUnavailable ? issueTitle : '',
        noteMsg: formatMessage(messages.postIssueNote),
        icon: PlusIcon,
        onClick: () => {
          setIssueActionType(POST_ISSUE);
          collapseTabsExceptCurr(SELECT_DEFECT_MANUALLY);
        },
        disabled: isPostIssueUnavailable,
      },
      {
        id: LINK_ISSUE,
        label: formatMessage(actionMessages[LINK_ISSUE]),
        hint: btsIntegrations.length ? '' : issueTitle,
        noteMsg: formatMessage(messages.linkIssueNote),
        icon: PlusIcon,
        onClick: () => {
          setIssueActionType(LINK_ISSUE);
          collapseTabsExceptCurr(SELECT_DEFECT_MANUALLY);
        },
        disabled: !btsIntegrations.length,
      },
    ];

    if (
      isBulkOperation
        ? itemData.some((item) => item.issue.externalSystemIssues.length > 0)
        : itemData.issue && itemData.issue.externalSystemIssues.length > 0
    ) {
      actionButtonItems.push({
        id: UNLINK_ISSUE,
        label: formatMessage(actionMessages[UNLINK_ISSUE]),
        noteMsg: formatMessage(messages.unlinkIssueNote),
        icon: UnlinkIcon,
        onClick: () => {
          setIssueActionType(UNLINK_ISSUE);
          collapseTabsExceptCurr(SELECT_DEFECT_MANUALLY);
        },
      });
    }
    return actionButtonItems;
  };
  const { width } = windowSize;

  const getDefectTypeNarrowView = () =>
    (width < BREAKPOINTS.SHORT_DEFECT_TYPE_NARROW_VIEW &&
      collapsedRightSection &&
      width > BREAKPOINTS.SCREEN_XS_MAX) ||
    (width < BREAKPOINTS.SHORT_DEFECT_TYPE_FULL_VIEW && !collapsedRightSection);

  return (
    <>
      {!isBulkOperation && width > BREAKPOINTS.HIDE_IGNORE_AA && (
        <InputSwitcher
          value={
            modalState.decisionType === SELECT_DEFECT_MANUALLY
              ? modalState.source.issue.ignoreAnalyzer
              : itemData.issue.ignoreAnalyzer
          }
          onChange={handleIgnoreAnalyzerChange}
          className={cx('ignore-analysis')}
          childrenFirst
          childrenClassName={cx('input-switcher-children')}
          size="medium"
          mode="dark"
        >
          <span>
            {formatMessage(
              (width < BREAKPOINTS.SHORT_MSG_FULL_VIEW && !collapsedRightSection) ||
                (width < BREAKPOINTS.SHORT_MSG_NARROW_VIEW && collapsedRightSection)
                ? messages.ignoreAaShort
                : messages.ignoreAa,
            )}
          </span>
        </InputSwitcher>
      )}
      <DefectTypeSelector
        selectDefectType={selectDefectTypeManually}
        selectedItem={
          modalState.decisionType === SELECT_DEFECT_MANUALLY
            ? modalState.source.issue.issueType || ''
            : itemData.issue.issueType
        }
        isNarrowView={getDefectTypeNarrowView()}
      />
      <div className={cx('defect-comment')}>
        <MarkdownEditor
          value={
            modalState.decisionType === SELECT_DEFECT_MANUALLY
              ? modalState.source.issue.comment
              : itemData.issue.comment
          }
          manipulateEditorOutside={setCommentEditor}
          onChange={handleDefectCommentChange}
          placeholder={formatMessage(
            isBulkOperation
              ? messages.defectCommentBulkOperationPlaceholder
              : messages.defectCommentPlaceholder,
          )}
          mode="dark"
        />
      </div>
      {!debugMode && (
        <ActionButtonsBar
          actionItems={getActionItems()}
          selectedItem={modalState.issueActionType}
        />
      )}
    </>
  );
};
SelectDefectManually.propTypes = {
  modalState: PropTypes.object.isRequired,
  itemData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  isBulkOperation: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
  collapseTabsExceptCurr: PropTypes.func.isRequired,
  windowSize: PropTypes.bool.isRequired,
  collapsedRightSection: PropTypes.bool.isRequired,
};
