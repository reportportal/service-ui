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

import React, { useEffect, useReducer, useState } from 'react';
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
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useWindowResize } from 'common/hooks';
import { MakeDecisionFooter } from './makeDecisionFooter';
import { MakeDecisionTabs } from './makeDecisionTabs';
import { MachineLearningSuggestions, SelectDefectManually, CopyFromHistoryLine } from './tabs';
import { messages } from './messages';
import {
  ACTIVE_TAB_MAP,
  ADD_FOR_ALL,
  CLEAR_FOR_ALL,
  COPY_FROM_HISTORY_LINE,
  CURRENT_EXECUTION_ONLY,
  CURRENT_LAUNCH,
  MACHINE_LEARNING_SUGGESTIONS,
  MAKE_DECISION_MODAL,
  NOT_CHANGED_FOR_ALL,
  REPLACE_FOR_ALL,
  SEARCH_MODES,
  SELECT_DEFECT_MANUALLY,
  SHOW_LOGS_BY_DEFAULT,
} from './constants';
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
    historyChoice: historyItems.find(
      (item) =>
        item.issue &&
        item.id !== itemData.id &&
        !item.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX),
    ),
    commentOption: isBulkOperation ? NOT_CHANGED_FOR_ALL : REPLACE_FOR_ALL,
  });
  const [activeTab, setActiveTab] = useState(SELECT_DEFECT_MANUALLY);
  const windowSize = useWindowResize();

  const [modalHasChanges, setModalHasChanges] = useState(false);
  const [loadingMLSuggest, setLoadingMLSuggest] = useState(false);
  useEffect(() => {
    let hasChanges;
    const newIssueData = modalState[ACTIVE_TAB_MAP[modalState.decisionType]].issue;
    if (
      isBulkOperation &&
      (!isMLSuggestionsAvailable || modalState.decisionType === SELECT_DEFECT_MANUALLY)
    ) {
      hasChanges =
        !!modalState.selectManualChoice.issue.issueType ||
        !!modalState.selectManualChoice.issue.comment ||
        modalState.commentOption !== NOT_CHANGED_FOR_ALL;
    } else if (isBulkOperation && isMLSuggestionsAvailable) {
      hasChanges = modalState.currentTestItems.some((item) => !isEqual(item.issue, newIssueData));
    } else {
      hasChanges = !isEqual(itemData.issue, newIssueData);
    }
    setModalHasChanges(hasChanges || !!modalState.issueActionType);
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

  const prepareDataToSend = ({ isIssueAction } = {}) => {
    const { issue } = modalState[ACTIVE_TAB_MAP[activeTab]];
    const { currentTestItems, selectedItems, commentOption } = modalState;
    if (isBulkOperation) {
      return currentTestItems.map((item) => {
        let comment;
        switch (commentOption) {
          case CLEAR_FOR_ALL: {
            comment = '';
            break;
          }
          case ADD_FOR_ALL: {
            comment = `${item.issue.comment || ''}\n${issue.comment}`.trim();
            break;
          }
          case REPLACE_FOR_ALL: {
            comment = issue.comment;
            break;
          }
          default: {
            comment = item.issue.comment || '';
          }
        }
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

    let newIssue = issue;

    if (activeTab === SELECT_DEFECT_MANUALLY) {
      const baseIssue = modalState.currentTestItems[0].issue;
      newIssue = Object.fromEntries(
        Object.entries(issue).filter(([key, val]) => baseIssue[key] !== val),
      );
    }

    return [...currentTestItems, ...selectedItems].map((item) => ({
      ...(isIssueAction ? { ...item, opened: SHOW_LOGS_BY_DEFAULT } : {}),
      id: item.id || item.itemId,
      testItemId: item.id || item.itemId,
      issue: {
        ...item.issue,
        ...newIssue,
        autoAnalyzed: false,
      },
    }));
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
      items,
    } = data;
    const {
      issueActionType,
      suggestedItems,
      selectManualChoice: {
        issue: { issueType },
      },
    } = modalState;

    const hasSuggestions = !!suggestedItems.length;

    return isBulkOperation
      ? editDefectsEvents.getClickOnApplyBulkEvent(
          defectFromTIGroup,
          issueActionType,
          items,
          issueType,
        )
      : editDefectsEvents.getClickOnApplyEvent(
          defectFromTIGroup,
          hasSuggestions,
          activeTab,
          issueType,
          itemData.issue.issueType,
          issueActionType,
          suggestedItems,
        );
  };

  const applyChanges = () => {
    if (isBulkOperation) {
      modalHasChanges &&
        activeTab === SELECT_DEFECT_MANUALLY &&
        (!!modalState.selectManualChoice.issue.issueType ||
          !!modalState.selectManualChoice.issue.comment ||
          modalState.commentOption === CLEAR_FOR_ALL) &&
        saveDefect();

      !isEmptyObject(modalState.suggestChoice) &&
        activeTab === MACHINE_LEARNING_SUGGESTIONS &&
        saveDefect();
    } else {
      modalHasChanges &&
        !isEqual(itemData.issue, modalState[ACTIVE_TAB_MAP[activeTab]].issue) &&
        saveDefect();
    }
    trackEvent(getOnApplyEvent());

    ((modalState.decisionType === COPY_FROM_HISTORY_LINE &&
      isEqual(itemData.issue, modalState.historyChoice.issue)) ||
      (modalState.decisionType === MACHINE_LEARNING_SUGGESTIONS &&
        isEqual(itemData.issue, modalState.suggestChoice.issue))) &&
      dispatch(hideModalAction());

    modalState.issueActionType && dispatch(hideModalAction()) && getIssueAction();
  };

  const getFooterButtons = () => ({
    okButton: (
      <GhostButton onClick={applyChanges} disabled={!modalHasChanges} color="''" appearance="topaz">
        {formatMessage(modalState.issueActionType ? messages.applyAndContinue : messages.apply)}
      </GhostButton>
    ),
    cancelButton: (
      <GhostButton
        onClick={() => dispatch(hideModalAction())}
        color="''"
        appearance="topaz"
        transparentBackground
      >
        {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
      </GhostButton>
    ),
  });

  const getMakeDecisionTabs = () => {
    const preparedHistoryLineItems = historyItems.filter(
      (item) =>
        item.issue &&
        item.id !== itemData.id &&
        !item.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX),
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
          modalState.suggestChoice.suggestRs &&
          formatMessage(messages.machineLearningSuggestions, {
            value: modalState.suggestChoice.suggestRs.matchScore,
          }),
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

  return (
    <DarkModalLayout
      headerTitle={formatMessage(messages.selectDefect)}
      modalHasChanges={modalHasChanges}
      hotKeyAction={hotKeyAction}
      modalNote={formatMessage(messages.modalNote)}
      sideSection={
        <ExecutionSection
          modalState={modalState}
          setModalState={setModalState}
          isBulkOperation={isBulkOperation}
          eventsInfo={data.eventsInfo.editDefectsEvents}
        />
      }
      footer={
        <MakeDecisionFooter
          buttons={getFooterButtons()}
          modalState={modalState}
          isBulkOperation={isBulkOperation}
          setModalState={setModalState}
          modalHasChanges={modalHasChanges}
          eventsInfo={data.eventsInfo.editDefectsEvents}
        />
      }
    >
      <MakeDecisionTabs
        tabs={getMakeDecisionTabs(windowSize)}
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
