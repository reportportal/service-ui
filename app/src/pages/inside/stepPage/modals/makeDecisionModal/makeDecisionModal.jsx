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
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { DarkModalLayout } from 'components/main/modal/darkModalLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import { activeProjectSelector } from 'controllers/user';
import { Accordion, useAccordionTabsState } from 'pages/inside/common/accordion';
import isEqual from 'fast-deep-equal';
import { URLS } from 'common/urls';
import { fetch, isEmptyObject } from 'common/utils';
import { historyItemsSelector } from 'controllers/log';
import { linkIssueAction, postIssueAction, unlinkIssueAction } from 'controllers/step';
import { LINK_ISSUE, POST_ISSUE, UNLINK_ISSUE } from 'common/constants/actionTypes';
import { analyzerExtensionsSelector } from 'controllers/appInfo';
import { MachineLearningSuggestions } from 'pages/inside/stepPage/modals/makeDecisionModal/machineLearningSuggestions';
import { SCREEN_MD_MAX } from 'common/constants/screenSizeVariables';
import { messages } from './messages';
import {
  COPY_FROM_HISTORY_LINE,
  CURRENT_EXECUTION_ONLY,
  MACHINE_LEARNING_SUGGESTIONS,
  MAKE_DECISION_MODAL,
  SEARCH_MODES,
  SELECT_DEFECT_MANUALLY,
  CURRENT_LAUNCH,
  TO_INVESTIGATE_LOCATOR_PREFIX,
} from './constants';
import { SelectDefectManually } from './selectDefectManually';
import { CopyFromHistoryLine } from './copyFromHistoryLine';
import { OptionsSection } from './optionsSection/optionsSection';

const MakeDecision = ({ data }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const historyItems = useSelector(historyItemsSelector);
  const isAnalyzerAvailable = !!useSelector(analyzerExtensionsSelector).length;
  const isBulkOperation = data.items && data.items.length > 1;
  const itemData = isBulkOperation ? data.items : data.items[0];
  const [modalState, setModalState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    source: {
      issue: isBulkOperation ? { comment: '' } : itemData.issue,
    },
    decisionType: SELECT_DEFECT_MANUALLY,
    issueActionType: '',
    optionValue:
      isAnalyzerAvailable &&
      itemData.issue &&
      itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX)
        ? CURRENT_LAUNCH
        : CURRENT_EXECUTION_ONLY,
    searchMode:
      isAnalyzerAvailable &&
      itemData.issue &&
      itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX)
        ? SEARCH_MODES.CURRENT_LAUNCH
        : '',
    testItems: [],
    selectedItems: [],
  });
  const [tabs, toggleTab, collapseTabsExceptCurr] = useAccordionTabsState({
    [MACHINE_LEARNING_SUGGESTIONS]: isAnalyzerAvailable,
    [COPY_FROM_HISTORY_LINE]: false,
    [SELECT_DEFECT_MANUALLY]: true,
  });
  const [modalHasChanges, setModalHasChanges] = useState(false);

  useEffect(() => {
    setModalHasChanges(
      (isBulkOperation
        ? !isEmptyObject(modalState.source.issue)
        : modalState.decisionType === SELECT_DEFECT_MANUALLY &&
          !isEqual(itemData.issue, modalState.source.issue)) ||
        modalState.decisionType === COPY_FROM_HISTORY_LINE ||
        !!modalState.issueActionType ||
        modalState.decisionType === MACHINE_LEARNING_SUGGESTIONS,
    );
  }, [modalState]);

  const fakeData = [...historyItems].map((item) => {
    return {
      ...item,
      score: 100,
      issue: {
        issueType: 'ti001',
        autoAnalyzed: false,
        ignoreAnalyzer: false,
        externalSystemIssues: [],
      },
      logs: [
        {
          binaryContent: {
            contentType: 'text/plain',
            id: '124649',
          },
          id: 1845974,
          itemId: 1162359,
          level: 'ERROR',
          message:
            '14:05:56.621 [TestNG-tests-1] ERROR o.s.test.context.TestContextManager - Caught exception while allowing TestExecutionListener [org.springframework.test.context.support.DependencyInjectionTestExecutionListener@7398c5e9] to prepare test instance [com.epam.ta.reportportal.qa.ws.tests.email_settings.EmailServerSettingsTest@5cc5b667]\njava.lang.IllegalStateException: Failed to load ApplicationContext\n\tat org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:124)\n\tat org.springframework.test.context.support.DefaultTestContext.getApplicationContext(DefaultTestContext.java:83)\n\tat org.springframework.test.context.support.DependencyInjectionTestExecutionListener.injectDependencies(DependencyInjectionTestExecutionListener.java:117)\n\tat org.springframework.test.context.support.DependencyInjectionTestExecutionListener.prepareTestInstance(DependencyInjectionTestExecutionListener.java:83)\n\tat org.springframework.test.context.TestContextManager.prepareTestInstance(TestContextManager.java:228)\n\tat org.springframework.test.context.testng.AbstractTestNGSpringContextTests.springTestContextPrepareTestInstance(AbstractTestNGSpringContextTests.java:149)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\n\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\n\tat java.lang.reflect.Method.invoke(Method.java:498)\n\tat org.testng.internal.MethodInvocationHelper.invokeMethod(MethodInvocationHelper.java:108)\n\tat org.testng.internal.Invoker.invokeConfigurationMethod(Invoker.java:523)\n\tat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:224)\n\tat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:146)\n\tat org.testng.internal.TestMethodWorker.invokeBeforeClassMethods(TestMethodWorker.java:166)\n\tat org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:105)\n\tat org.testng.TestRunner.privateRun(TestRunner.java:744)\n\tat org.testng.TestRunner.run(TestRunner.java:602)\n\tat org.testng.SuiteRunner.runTest(SuiteRunner.java:380)\n\tat org.testng.SuiteRunner.access$000(SuiteRunner.java:39)\n\tat org.testng.SuiteRunner$SuiteWorker.run(SuiteRunner.java:414)\n\tat org.testng.internal.thread.ThreadUtil$1.call(ThreadUtil.java:52)\n\tat java.util.concurrent.FutureTask.run(FutureTask.java:266)\n\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)\n\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)\n\tat java.lang.Thread.run(Thread.java:748)',
          time: 1624267295074,
        },
      ],
    };
  });

  const prepareDataToSend = ({ isIssueAction, replaceComment } = {}) => {
    const { issue } = modalState.source;
    if (isBulkOperation) {
      const { selectedItems: items } = modalState;
      return items.map((item) => {
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
    return modalState.selectedItems.map((item, i) => {
      const comment =
        issue.comment !== item.issue.comment &&
        (modalState.decisionType === COPY_FROM_HISTORY_LINE || i !== 0)
          ? `${item.issue.comment || ''}\n${issue.comment}`.trim()
          : issue.comment || '';

      return {
        ...(isIssueAction ? item : {}),
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
  const saveDefect = (options) => {
    const { fetchFunc } = data;
    const issues = prepareDataToSend(options);
    const url = URLS.testItems(activeProject);

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
  const applyChangesImmediately = (options) => {
    if (isBulkOperation) {
      modalHasChanges && !isEmptyObject(modalState.source.issue) && saveDefect(options);
    } else {
      modalHasChanges && !isEqual(itemData.issue, modalState.source.issue) && saveDefect(options);
    }
    modalState.decisionType === (COPY_FROM_HISTORY_LINE || MACHINE_LEARNING_SUGGESTIONS) &&
      isEqual(itemData.issue, modalState.source.issue) &&
      dispatch(hideModalAction());
    modalState.issueActionType && dispatch(hideModalAction()) && getIssueAction();
  };
  const applyImmediatelyWithComment = () => {
    applyChangesImmediately({ replaceComment: true });
  };
  const applyChanges = () => applyChangesImmediately();

  const renderHeaderElements = () => {
    return (
      <>
        {isBulkOperation && (
          <GhostButton
            onClick={applyImmediatelyWithComment}
            disabled={!modalHasChanges}
            transparentBorder
            transparentBackground
            appearance="topaz"
          >
            {formatMessage(
              modalState.source.issue.comment
                ? messages.replaceCommentsAndApply
                : messages.clearCommentsAndApply,
            )}
          </GhostButton>
        )}
        <GhostButton
          onClick={applyChanges}
          disabled={modalState.selectedItems.length === 0 || !modalHasChanges}
          color="''"
          appearance="topaz"
        >
          {modalState.selectedItems.length > 1
            ? formatMessage(messages.applyToItems, {
                itemsCount: modalState.selectedItems.length,
              })
            : formatMessage(
                modalState.issueActionType ? messages.applyAndContinue : messages.apply,
              )}
        </GhostButton>
      </>
    );
  };

  const getAccordionTabs = (collapsedRightSection, windowSize) => {
    const preparedHistoryLineItems = historyItems.filter(
      (item) => item.issue && item.id !== itemData.id,
    );
    const tabsData = [
      {
        id: MACHINE_LEARNING_SUGGESTIONS,
        shouldShow: !isBulkOperation,
        disabled: !isAnalyzerAvailable,
        isOpen: tabs[MACHINE_LEARNING_SUGGESTIONS],
        title: (
          <div title={!isAnalyzerAvailable ? formatMessage(messages.analyzerUnavailable) : ''}>
            {formatMessage(messages.machineLearningSuggestions)}
          </div>
        ),
        content: (
          <MachineLearningSuggestions
            items={fakeData}
            modalState={modalState}
            setModalState={setModalState}
            itemData={itemData}
            collapseTabsExceptCurr={collapseTabsExceptCurr}
          />
        ),
      },
      {
        id: SELECT_DEFECT_MANUALLY,
        shouldShow: true,
        disabled: false,
        isOpen: tabs[SELECT_DEFECT_MANUALLY],
        title: formatMessage(messages.selectDefectTypeManually),
        content: (
          <SelectDefectManually
            itemData={itemData}
            modalState={modalState}
            setModalState={setModalState}
            isBulkOperation={isBulkOperation}
            collapseTabsExceptCurr={collapseTabsExceptCurr}
            collapsedRightSection={collapsedRightSection}
            windowSize={windowSize}
          />
        ),
      },
    ];
    if (preparedHistoryLineItems.length > 0) {
      tabsData.splice(1, 0, {
        id: COPY_FROM_HISTORY_LINE,
        shouldShow: !isBulkOperation,
        disabled: false,
        isOpen: tabs[COPY_FROM_HISTORY_LINE],
        title: formatMessage(messages.copyFromHistoryLine),
        content: (
          <CopyFromHistoryLine
            items={preparedHistoryLineItems}
            itemData={itemData}
            modalState={modalState}
            setModalState={setModalState}
            collapseTabsExceptCurr={collapseTabsExceptCurr}
            windowSize={windowSize}
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
      <OptionsSection
        currentTestItem={itemData}
        modalState={modalState}
        setModalState={setModalState}
        isNarrowView={collapsedRightSection}
        isBulkOperation={isBulkOperation}
      />
    );
  };

  return (
    <DarkModalLayout
      renderTitle={renderTitle}
      renderHeaderElements={renderHeaderElements}
      modalHasChanges={modalHasChanges}
      hotKeyAction={hotKeyAction}
      modalNote={formatMessage(messages.modalNote)}
      renderRightSection={renderRightSection}
    >
      {({ collapsedRightSection, windowSize }) => (
        <Accordion
          tabs={getAccordionTabs(collapsedRightSection, windowSize)}
          toggleTab={toggleTab}
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
  }).isRequired,
};
export const MakeDecisionModal = withModal(MAKE_DECISION_MODAL)(MakeDecision);
