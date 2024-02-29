/*
 * Copyright 2023 EPAM Systems
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
import { ExtensionLoader } from 'components/extensionLoader';
import { MarkdownEditor } from 'components/main/markdown';
import { getIssueTitle } from 'pages/inside/common/utils';
import { DefectTypeSelector } from 'pages/inside/common/defectTypeSelector';
import { debugModeSelector } from 'controllers/launch';
import { SCREEN_SM_MAX, SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import {
  makeDecisionDefectCommentAddonSelector,
  makeDecisionDefectTypeAddonSelector,
} from 'controllers/plugins/uiExtensions/selectors';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import {
  ADD_FOR_ALL,
  NOT_CHANGED_FOR_ALL,
  REPLACE_FOR_ALL,
  SELECT_DEFECT_MANUALLY,
} from '../../constants';
import { messages } from '../../messages';
import { ActionButtonsBar } from './actionButtonsBar';
import styles from './selectDefectManually.scss';

const cx = classNames.bind(styles);

export const SelectDefectManually = ({
  modalState,
  itemData,
  isBulkOperation,
  setModalState,
  windowSize,
  eventsInfo,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const defectCommentExtensions = useSelector(makeDecisionDefectCommentAddonSelector);
  const defectTypeExtensions = useSelector(makeDecisionDefectTypeAddonSelector);
  const btsIntegrations = useSelector(availableBtsIntegrationsSelector);
  const isBtsPluginsExist = useSelector(isBtsPluginsExistSelector);
  const enabledBtsPlugins = useSelector(enabledBtsPluginsSelector);
  const debugMode = useSelector(debugModeSelector);
  const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);
  const [commentEditor, setCommentEditor] = useState(null);
  const defectFromTIGroup =
    itemData.issue && itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

  const source = modalState.selectManualChoice;

  const handleManualChange = (value = {}, extraAnalyticsParams = {}) => {
    const issue = {
      ...(modalState.decisionType === SELECT_DEFECT_MANUALLY ? source.issue : itemData.issue),
      ...value,
    };
    setModalState({
      ...modalState,
      decisionType: SELECT_DEFECT_MANUALLY,
      selectManualChoice: { issue },
      extraAnalyticsParams: {
        ...modalState.extraAnalyticsParams,
        ...extraAnalyticsParams,
      },
    });
    if (!issue.comment) {
      commentEditor.focus();
    }
  };

  const selectDefectTypeManually = (value) => {
    handleManualChange({ issueType: value });
  };
  const handleIgnoreAnalyzerChange = (e) => {
    handleManualChange({ ignoreAnalyzer: e.target.checked });
    const { getClickIgnoreAACheckboxEvent } = eventsInfo;
    trackEvent(getClickIgnoreAACheckboxEvent(defectFromTIGroup, e.target.checked));
  };
  const handleDefectCommentChange = (value) => {
    handleManualChange({ comment: value.trim() }, { link_name: true });
    if (isBulkOperation) {
      const isValueEmpty = value.trim() === '';
      if (!source.issue.comment && !isValueEmpty) {
        setModalState({ commentOption: ADD_FOR_ALL });
      } else if (
        isValueEmpty &&
        [ADD_FOR_ALL, REPLACE_FOR_ALL].includes(modalState.commentOption)
      ) {
        setModalState({ commentOption: NOT_CHANGED_FOR_ALL });
      }
    }
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
                decisionType: SELECT_DEFECT_MANUALLY,
                issueActionType,
                selectManualChoice: { issue: itemData.issue },
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
        },
      });
    }
    return actionButtonItems;
  };
  const { width } = windowSize;

  const getDefectTypeNarrowView = () => width < SCREEN_SM_MAX && width > SCREEN_XS_MAX;

  const updateExtraAnalyticsParams = (extraAnalyticsParams) => {
    setModalState({
      extraAnalyticsParams: {
        ...modalState.extraAnalyticsParams,
        ...extraAnalyticsParams,
      },
    });
  };

  const createDefectTypesBlock = (addons = {}) => (
    <>
      {!isBulkOperation && (
        <div className={cx('defect-types-extra-block')}>
          {addons.addonBlock}
          <InputCheckbox
            value={
              modalState.decisionType === SELECT_DEFECT_MANUALLY
                ? source.issue.ignoreAnalyzer
                : itemData.issue.ignoreAnalyzer
            }
            onChange={handleIgnoreAnalyzerChange}
            iconTransparentBackground
            darkView
          >
            <span className={cx('ignore-analysis-text')}>
              {formatMessage(width < SCREEN_SM_MAX ? messages.ignoreAaShort : messages.ignoreAa)}
            </span>
          </InputCheckbox>
        </div>
      )}
      <DefectTypeSelector
        selectDefectType={selectDefectTypeManually}
        selectedItem={
          modalState.decisionType === SELECT_DEFECT_MANUALLY
            ? source.issue.issueType || ''
            : itemData.issue.issueType
        }
        isNarrowView={getDefectTypeNarrowView()}
        highlightedItem={addons.highlightedItem}
      />
    </>
  );

  return (
    <div className={cx('select-defect-wrapper')}>
      {!isBulkOperation && defectTypeExtensions.length
        ? defectTypeExtensions.map((extension) => (
            <ExtensionLoader
              key={extension.name}
              extension={extension}
              item={itemData}
              updateExtraAnalyticsParams={updateExtraAnalyticsParams}
            >
              {createDefectTypesBlock}
            </ExtensionLoader>
          ))
        : createDefectTypesBlock()}
      <div className={cx('defect-comment')}>
        <MarkdownEditor
          value={
            modalState.decisionType === SELECT_DEFECT_MANUALLY
              ? source.issue.comment
              : itemData.issue.comment
          }
          manipulateEditorOutside={setCommentEditor}
          onChange={handleDefectCommentChange}
          eventsInfo={{
            onClickToolbarIcon:
              eventsInfo.getClickCommentEditorIcon &&
              eventsInfo.getClickCommentEditorIcon(defectFromTIGroup),
          }}
          placeholder={formatMessage(messages.comment)}
          mode="dark"
          controlled={defectCommentExtensions.length !== 0}
        />
        {!isBulkOperation &&
          defectCommentExtensions.map((extension) => (
            <ExtensionLoader
              key={extension.name}
              extension={extension}
              onChangeComment={handleDefectCommentChange}
              comment={source.issue.comment}
              item={itemData}
              updateExtraAnalyticsParams={updateExtraAnalyticsParams}
            />
          ))}
      </div>
      {!debugMode && (
        <ActionButtonsBar
          actionItems={getActionItems()}
          selectedItem={modalState.issueActionType}
        />
      )}
    </div>
  );
};
SelectDefectManually.propTypes = {
  modalState: PropTypes.object.isRequired,
  itemData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  isBulkOperation: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
  windowSize: PropTypes.object.isRequired,
  eventsInfo: PropTypes.object,
};
SelectDefectManually.defaultProps = {
  eventsInfo: {},
};
