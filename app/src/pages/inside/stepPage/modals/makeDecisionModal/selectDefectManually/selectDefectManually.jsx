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
import { useTracking } from 'react-tracking';
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
import { SCREEN_MD_MAX, SCREEN_SM_MAX, SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { SELECT_DEFECT_MANUALLY } from '../constants';
import { messages } from '../messages';
import { ActionButtonsBar } from './actionButtonsBar';
import styles from './selectDefectManually.scss';

const cx = classNames.bind(styles);

export const SelectDefectManually = ({
  modalState,
  itemData,
  isBulkOperation,
  setModalState,
  collapseTabsExceptCurr,
  windowSize,
  collapsedRightSection,
  eventsInfo,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const btsIntegrations = useSelector(availableBtsIntegrationsSelector);
  const isBtsPluginsExist = useSelector(isBtsPluginsExistSelector);
  const enabledBtsPlugins = useSelector(enabledBtsPluginsSelector);
  const debugMode = useSelector(debugModeSelector);
  const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);
  const [commentEditor, setCommentEditor] = useState(null);
  const defectFromTIGroup =
    itemData.issue && itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

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
    const { toggleIgnoreAASwitcher } = eventsInfo;
    trackEvent(toggleIgnoreAASwitcher(defectFromTIGroup, value));
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
    const { onClickIssueBtn } = eventsInfo;
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
          trackEvent(onClickIssueBtn(defectFromTIGroup, actionMessages[POST_ISSUE].defaultMessage));
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
          trackEvent(onClickIssueBtn(defectFromTIGroup, actionMessages[LINK_ISSUE].defaultMessage));
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
          trackEvent(
            onClickIssueBtn(defectFromTIGroup, actionMessages[UNLINK_ISSUE].defaultMessage),
          );
        },
      });
    }
    return actionButtonItems;
  };
  const { width } = windowSize;

  const getDefectTypeNarrowView = () =>
    (width < SCREEN_SM_MAX && collapsedRightSection && width > SCREEN_XS_MAX) ||
    (width < SCREEN_MD_MAX && !collapsedRightSection);

  return (
    <>
      {!isBulkOperation && (
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
            {formatMessage(width < SCREEN_SM_MAX ? messages.ignoreAaShort : messages.ignoreAa)}
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
  windowSize: PropTypes.object.isRequired,
  collapsedRightSection: PropTypes.bool.isRequired,
  eventsInfo: PropTypes.object,
};
SelectDefectManually.defaultProps = {
  eventsInfo: {},
};
