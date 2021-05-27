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

import React from 'react';
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
import { DefectTypeSelectorML } from 'pages/inside/common/defectTypeSelectorML';
import { SELECT_DEFECT_MANUALLY } from '../../constants';
import { messages } from '../../messages';
import { ActionButtonsBar } from './actionButtonsBar';
import styles from './selectDefectManually.scss';

const cx = classNames.bind(styles);

export const SelectDefectManually = ({
  modalState,
  itemData,
  isBulkOperation,
  setModalState,
  collapseTabsExceptCurr,
  isNarrowView,
}) => {
  const { formatMessage } = useIntl();
  const btsIntegrations = useSelector(availableBtsIntegrationsSelector);
  const isBtsPluginsExist = useSelector(isBtsPluginsExistSelector);
  const enabledBtsPlugins = useSelector(enabledBtsPluginsSelector);
  const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);

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
          <span>{formatMessage(messages.ignoreAa)}</span>
        </InputSwitcher>
      )}
      <DefectTypeSelectorML
        selectDefectType={selectDefectTypeManually}
        selectedItem={
          modalState.decisionType === SELECT_DEFECT_MANUALLY
            ? modalState.source.issue.issueType || ''
            : itemData.issue.issueType
        }
        isNarrowView={isNarrowView}
      />
      <div className={cx('defect-comment')}>
        <MarkdownEditor
          value={
            modalState.decisionType === SELECT_DEFECT_MANUALLY
              ? modalState.source.issue.comment
              : itemData.issue.comment
          }
          onChange={handleDefectCommentChange}
          placeholder={formatMessage(
            isBulkOperation
              ? messages.defectCommentBulkOperationPlaceholder
              : messages.defectCommentPlaceholder,
          )}
          mode="dark"
        />
      </div>
      <ActionButtonsBar actionItems={getActionItems()} selectedItem={modalState.issueActionType} />
    </>
  );
};
SelectDefectManually.propTypes = {
  modalState: PropTypes.object.isRequired,
  itemData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  isBulkOperation: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
  collapseTabsExceptCurr: PropTypes.func.isRequired,
  isNarrowView: PropTypes.bool,
};
