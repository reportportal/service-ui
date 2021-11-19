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

import React, { useEffect, useMemo, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { hideModalAction, withModal } from 'controllers/modal';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { DarkModalLayout } from 'components/main/modal/darkModalLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import { activeProjectSelector } from 'controllers/user';
import isEqual from 'fast-deep-equal';
import { URLS } from 'common/urls';
import { fetch, isEmptyObject } from 'common/utils';
import { historyItemsSelector } from 'controllers/log';
import { linkIssueAction, postIssueAction, unlinkIssueAction } from 'controllers/step';
import { LINK_ISSUE, POST_ISSUE, UNLINK_ISSUE } from 'common/constants/actionTypes';
import { analyzerExtensionsSelector } from 'controllers/appInfo';
import { SCREEN_MD_MAX } from 'common/constants/screenSizeVariables';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { actionMessages } from 'common/constants/localization/eventsLocalization';
import { MachineLearningSuggestions } from './machineLearningSuggestions';
import { MakeDecisionTabs } from './makeDecisionTabs';
import { messages } from './messages';
import {
  ACTIVE_TAB_MAP,
  COPY_FROM_HISTORY_LINE,
  CURRENT_EXECUTION_ONLY,
  CURRENT_LAUNCH,
  MACHINE_LEARNING_SUGGESTIONS,
  MAKE_DECISION_MODAL,
  SEARCH_MODES,
  SELECT_DEFECT_MANUALLY,
  SHOW_LOGS_BY_DEFAULT,
} from './constants';
import { SelectDefectManually } from './selectDefectManually';
import { CopyFromHistoryLine } from './copyFromHistoryLine';
import { ExecutionSection } from './executionSection';

const MakeDecision = ({ data }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const historyItems = useSelector(historyItemsSelector);
  const isAnalyzerAvailable = !!useSelector(analyzerExtensionsSelector).length;
  const isBulkOperation = data.items && data.items.length > 1;
  const itemData = isBulkOperation ? data.items : data.items[0];
  const clusterIds = data.items[0].clusterId
    ? Array.from(new Set(data.items.map(({ clusterId }) => clusterId)))
    : [];
  const isMLSuggestionsAvailable = !isBulkOperation || clusterIds.length === 1;
  const defectFromTIGroup =
    itemData.issue && itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);
  const [modalState, setModalState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    decisionType: SELECT_DEFECT_MANUALLY,
    issueActionType: '',
    optionValue: isAnalyzerAvailable && defectFromTIGroup ? CURRENT_LAUNCH : CURRENT_EXECUTION_ONLY,
    searchMode: isAnalyzerAvailable && defectFromTIGroup ? SEARCH_MODES.CURRENT_LAUNCH : '',
    currentTestItems: data.items,
    testItems: [],
    selectedItems: [],
    suggestedItems: [],
    startTime: Date.now(),
    selectManualChoice: { issue: isBulkOperation ? { comment: '' } : itemData.issue },
    suggestChoice: {},
    historyChoice: historyItems.find((item) => item.issue && item.id !== itemData.id),
  });
  const [activeTab, setActiveTab] = useState(SELECT_DEFECT_MANUALLY);

  const [modalHasChanges, setModalHasChanges] = useState(false);
  const [loadingMLSuggest, setLoadingMLSuggest] = useState(false);
  useEffect(() => {
    setModalHasChanges(
      (isBulkOperation
        ? !!modalState.selectManualChoice.issue.issueType ||
          !!modalState.selectManualChoice.issue.comment
        : modalState.decisionType === SELECT_DEFECT_MANUALLY &&
          !isEqual(itemData.issue, modalState.selectManualChoice.issue)) ||
        (modalState.decisionType === COPY_FROM_HISTORY_LINE &&
          !isEmptyObject(modalState.historyChoice)) ||
        !!modalState.issueActionType ||
        modalState.decisionType === MACHINE_LEARNING_SUGGESTIONS,
    );
  }, [modalState]);

  useEffect(() => {
    if (isMLSuggestionsAvailable) {
      setLoadingMLSuggest(true);
      const url =
        clusterIds.length === 1
          ? URLS.MLSuggestionsByCluster(activeProject, clusterIds[0])
          : URLS.MLSuggestions(activeProject, itemData.id);
      fetch(url)
        .then((resp) => {
          if (resp.length !== 0) {
            setModalState({ suggestedItems: resp });
          }
          setLoadingMLSuggest(false);
        })
        .catch(() => {
          setLoadingMLSuggest(false);
        });
    }
  }, []);

  const prepareDataToSend = ({ isIssueAction, replaceComment } = {}) => {
    const { issue } = modalState[ACTIVE_TAB_MAP[activeTab]];
    const { currentTestItems, selectedItems } = modalState;
    if (isBulkOperation) {
      return currentTestItems.map((item) => {
        const comment = replaceComment
          ? issue.comment
          : `${item.issue.comment || ''}\n${issue.comment}`.trim();
        return {
          ...(isIssueAction ? item : {}),
          testItemId: item.id,
          issue: {
            ...item.issue,
            ...issue,
            comment,
            autoAnalyzed: false,
          },
        };
      });
    }
    return [...currentTestItems, ...selectedItems].map((item, i) => {
      const comment =
        issue.comment !== item.issue.comment &&
        (modalState.decisionType === COPY_FROM_HISTORY_LINE || i !== 0)
          ? `${item.issue.comment || ''}\n${issue.comment}`.trim()
          : issue.comment || '';

      return {
        ...(isIssueAction ? { ...item, opened: SHOW_LOGS_BY_DEFAULT } : {}),
        id: item.id || item.itemId,
        testItemId: item.id || item.itemId,
        issue: {
          ...issue,
          comment,
          autoAnalyzed: false,
        },
      };
    });
  };
  const sendSuggestResponse = () => {
    const dataToSend = modalState.suggestedItems.map((item) => {
      if (modalState[ACTIVE_TAB_MAP[activeTab]].id === item.testItemResource.id) {
        return {
          ...item.suggestRs,
          userChoice: 1,
        };
      }
      return item.suggestRs;
    });
    fetch(URLS.choiceSuggestedItems(activeProject), {
      method: 'put',
      data: dataToSend,
    })
      .then(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.suggestedChoiceSuccess),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );
      })
      .catch(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.suggestedChoiceFailed),
            type: NOTIFICATION_TYPES.ERROR,
          }),
        );
      });
  };
  const saveDefect = (options) => {
    const { fetchFunc } = data;
    const issues = prepareDataToSend(options);
    const url = URLS.testItems(activeProject);

    if (modalState.suggestedItems.length > 0) {
      sendSuggestResponse();
    }

    fetch(url, {
      method: 'put',
      data: {
        issues,
      },
    })
      .then(() => {
        fetchFunc(issues);
        dispatch(
          showNotification({
            message: formatMessage(messages.updateDefectsSuccess),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );
      })
      .catch(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.updateDefectsFailed),
            type: NOTIFICATION_TYPES.ERROR,
          }),
        );
      });
    dispatch(hideModalAction());
  };

  const handlePostIssue = () => {
    const { postIssueEvents } = data.eventsInfo;
    dispatch(
      postIssueAction(prepareDataToSend({ isIssueAction: true }), {
        fetchFunc: data.fetchFunc,
        eventsInfo: postIssueEvents,
      }),
    );
  };
  const handleLinkIssue = () => {
    const { linkIssueEvents } = data.eventsInfo;
    dispatch(
      linkIssueAction(prepareDataToSend({ isIssueAction: true }), {
        fetchFunc: data.fetchFunc,
        eventsInfo: linkIssueEvents,
      }),
    );
  };
  const handleUnlinkIssue = () => {
    const { unlinkIssueEvents } = data.eventsInfo;
    const selectedItems = isBulkOperation
      ? prepareDataToSend({ isIssueAction: true }).filter(
          (item) => item.issue.externalSystemIssues.length > 0,
        )
      : prepareDataToSend({ isIssueAction: true });
    dispatch(
      unlinkIssueAction(selectedItems, {
        fetchFunc: data.fetchFunc,
        eventsInfo: unlinkIssueEvents,
      }),
    );
  };

  const getIssueAction = () => {
    switch (modalState.issueActionType) {
      case POST_ISSUE:
        return handlePostIssue();
      case LINK_ISSUE:
        return handleLinkIssue();
      case UNLINK_ISSUE:
        return handleUnlinkIssue();
      default:
        return false;
    }
  };
  const getOnApplyEvent = () => {
    const {
      eventsInfo: { editDefectsEvents = {} },
    } = data;
    const { onApply, onApplyAndContinue } = editDefectsEvents;
    const {
      decisionType,
      issueActionType,
      optionValue,
      selectedItems,
      suggestedItems,
      startTime,
    } = modalState;
    let eventInfo;
    const hasSuggestions = !!suggestedItems.length;
    if (isEqual(itemData.issue, modalState[ACTIVE_TAB_MAP[activeTab]].issue) && issueActionType) {
      const issueActionLabel = issueActionType && actionMessages[issueActionType].defaultMessage;
      eventInfo =
        onApplyAndContinue &&
        onApplyAndContinue(defectFromTIGroup, hasSuggestions, issueActionLabel, defectFromTIGroup);
    } else {
      const section = messages[decisionType].defaultMessage;
      const optionLabel = messages[optionValue].defaultMessage;
      const selectedItemsLength = selectedItems.length;
      const timestamp = Date.now() - startTime;
      eventInfo =
        onApply &&
        onApply(
          section,
          defectFromTIGroup,
          hasSuggestions,
          optionLabel,
          selectedItemsLength,
          timestamp,
        );
    }
    return eventInfo;
  };
  const applyChangesImmediately = () => {
    if (isBulkOperation) {
      modalHasChanges &&
        activeTab === SELECT_DEFECT_MANUALLY &&
        (!!modalState.selectManualChoice.issue.issueType ||
          !!modalState.selectManualChoice.issue.comment) &&
        saveDefect();

      !isEmptyObject(modalState.suggestChoice) &&
        activeTab === MACHINE_LEARNING_SUGGESTIONS &&
        saveDefect();
    } else {
      modalHasChanges &&
        !isEqual(itemData.issue, modalState[ACTIVE_TAB_MAP[activeTab]].issue) &&
        saveDefect();
      trackEvent(getOnApplyEvent());
    }

    ((modalState.decisionType === COPY_FROM_HISTORY_LINE &&
      isEqual(itemData.issue, modalState.historyChoice.issue)) ||
      (modalState.decisionType === MACHINE_LEARNING_SUGGESTIONS &&
        isEqual(itemData.issue, modalState.suggestChoice.issue))) &&
      dispatch(hideModalAction());

    modalState.issueActionType && dispatch(hideModalAction()) && getIssueAction();
  };
  const applyImmediatelyWithComment = () => {
    saveDefect({ replaceComment: true });
  };
  const applyChanges = () => applyChangesImmediately();

  const renderHeaderElements = () => {
    return (
      <>
        {isBulkOperation && (
          <GhostButton
            onClick={applyImmediatelyWithComment}
            disabled={
              modalState[ACTIVE_TAB_MAP[activeTab]].issue.comment
                ? false
                : !modalState.currentTestItems.some(({ issue }) => !!issue.comment)
            }
            transparentBorder
            transparentBackground
            appearance="topaz"
          >
            {formatMessage(
              modalState[ACTIVE_TAB_MAP[activeTab]].issue.comment
                ? messages.replaceCommentsAndApply
                : messages.clearCommentsAndApply,
            )}
          </GhostButton>
        )}
        <GhostButton
          onClick={applyChanges}
          disabled={!modalHasChanges}
          color="''"
          appearance="topaz"
        >
          {modalState.selectedItems.length > 1
            ? formatMessage(messages.applyToItems, {
                itemsCount: modalState.selectedItems.length + 1,
              })
            : formatMessage(
                modalState.issueActionType ? messages.applyAndContinue : messages.apply,
              )}
        </GhostButton>
      </>
    );
  };

  const getMakeDicisionTabs = (collapsedRightSection, windowSize) => {
    const preparedHistoryLineItems = historyItems.filter(
      (item) => item.issue && item.id !== itemData.id,
    );
    const tabsData = [
      {
        id: SELECT_DEFECT_MANUALLY,
        shouldShow: true,
        isOpen: activeTab === SELECT_DEFECT_MANUALLY,
        title: formatMessage(messages.selectDefectTypeManually),
        content: (
          <SelectDefectManually
            itemData={itemData}
            modalState={modalState}
            setModalState={setModalState}
            isBulkOperation={isBulkOperation}
            collapsedRightSection={collapsedRightSection}
            windowSize={windowSize}
            eventsInfo={data.eventsInfo.editDefectsEvents}
          />
        ),
      },
      {
        id: MACHINE_LEARNING_SUGGESTIONS,
        shouldShow: isMLSuggestionsAvailable,
        isOpen: activeTab === MACHINE_LEARNING_SUGGESTIONS,
        title:
          clusterIds.length === 1 ? (
            <div>
              {formatMessage(messages.machineLearningSuggestions, {
                target:
                  clusterIds.length === 1 ? formatMessage(messages.MLSuggestionsForCluster) : '',
              })}
            </div>
          ) : null,
        content: isMLSuggestionsAvailable && (
          <MachineLearningSuggestions
            modalState={modalState}
            itemData={itemData}
            eventsInfo={data.eventsInfo.editDefectsEvents}
          />
        ),
      },
    ];
    if (preparedHistoryLineItems.length > 0) {
      tabsData.push({
        id: COPY_FROM_HISTORY_LINE,
        shouldShow: !isBulkOperation,
        isOpen: activeTab === COPY_FROM_HISTORY_LINE,
        title: formatMessage(messages.copyFromHistoryLine),
        content: (
          <CopyFromHistoryLine
            items={preparedHistoryLineItems}
            itemData={itemData}
            modalState={modalState}
            setModalState={setModalState}
            windowSize={windowSize}
            eventsInfo={data.eventsInfo.editDefectsEvents}
            activeProject={activeProject}
          />
        ),
      });
    }
    return tabsData;
  };

  const hotKeyAction = {
    ctrlEnter: applyChanges,
  };

  const renderTitle = (collapsedRightSection, windowSize) => {
    const { width } = windowSize;
    if (isBulkOperation) {
      return formatMessage(collapsedRightSection ? messages.bulkOperationDecision : messages.bulk);
    } else {
      return formatMessage(
        collapsedRightSection && width > SCREEN_MD_MAX ? messages.decisionForTest : messages.test,
        {
          launchNumber: itemData.launchNumber && `#${itemData.launchNumber}`,
        },
      );
    }
  };

  const renderRightSection = (collapsedRightSection) => {
    return (
      <ExecutionSection
        modalState={modalState}
        setModalState={setModalState}
        isNarrowView={collapsedRightSection}
        isBulkOperation={isBulkOperation}
        eventsInfo={data.eventsInfo.editDefectsEvents}
      />
    );
  };
  const layoutEventsInfo = useMemo(() => {
    const { suggestedItems, startTime } = modalState;
    const hasSuggestions = !!suggestedItems.length;
    return {
      openCloseRightSection: (isOpen) =>
        data.eventsInfo.editDefectsEvents &&
        data.eventsInfo.editDefectsEvents.openCloseRightSection(defectFromTIGroup, isOpen),
      closeModal: (endTime) =>
        data.eventsInfo.editDefectsEvents &&
        data.eventsInfo.editDefectsEvents.closeModal(
          defectFromTIGroup,
          hasSuggestions,
          endTime - startTime,
        ),
    };
  }, [modalState.suggestedItems]);

  return (
    <DarkModalLayout
      renderTitle={renderTitle}
      renderHeaderElements={renderHeaderElements}
      modalHasChanges={modalHasChanges}
      hotKeyAction={hotKeyAction}
      modalNote={formatMessage(messages.modalNote)}
      renderRightSection={renderRightSection}
      eventsInfo={layoutEventsInfo}
    >
      {({ collapsedRightSection, windowSize }) => (
        <MakeDecisionTabs
          tabs={getMakeDicisionTabs(collapsedRightSection, windowSize)}
          toggleTab={setActiveTab}
          suggestedItems={modalState.suggestedItems}
          loadingMLSuggest={loadingMLSuggest}
          modalState={modalState}
          setModalState={setModalState}
          itemData={itemData}
          isBulkOperation={isBulkOperation}
          isAnalyzerAvailable={isAnalyzerAvailable}
          isMLSuggestionsAvailable={isMLSuggestionsAvailable}
        />
      )}
    </DarkModalLayout>
  );
};
MakeDecision.propTypes = {
  data: PropTypes.shape({
    items: PropTypes.array,
    fetchFunc: PropTypes.func,
    eventsInfo: PropTypes.object,
    clusterIds: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};
export const MakeDecisionModal = withModal(MAKE_DECISION_MODAL)(MakeDecision);
