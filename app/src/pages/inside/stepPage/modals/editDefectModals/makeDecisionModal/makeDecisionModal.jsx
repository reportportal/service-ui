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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { hideModalAction, withModal } from 'controllers/modal';
import { useIntl } from 'react-intl';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { DarkModalLayout } from 'components/main/modal/darkModalLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import { activeProjectSelector } from 'controllers/user';
import { Accordion } from 'pages/inside/common/accordion';
import { DefectTypeSelectorML } from 'pages/inside/common/defectTypeSelectorML';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import isEqual from 'fast-deep-equal';
import { URLS } from 'common/urls';
import { fetch, isEmptyObject } from 'common/utils';
import classNames from 'classnames/bind';
import PlusIcon from 'common/img/plus-button-inline.svg';
import UnlinkIcon from 'common/img/unlink-inline.svg';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import { linkIssueAction, postIssueAction, unlinkIssueAction } from 'controllers/step';
import { actionMessages } from 'common/constants/localization/eventsLocalization';
import {
  availableBtsIntegrationsSelector,
  enabledBtsPluginsSelector,
  isBtsPluginsExistSelector,
  isPostIssueActionAvailable,
} from 'controllers/plugins';
import { getIssueTitle } from 'pages/inside/common/utils';
import { LINK_ISSUE, POST_ISSUE, UNLINK_ISSUE } from 'common/constants/actionTypes';
import { ExecutionInfo } from 'pages/inside/logsPage/defectEditor/executionInfo';
import { historyItemsSelector } from 'controllers/log';
import { ActionButtonsBar } from './actionButtonsBar';
import { messages } from './../messages';
import {
  CONFIGURATION,
  COPY_FROM_HISTORY_LINE,
  MACHINE_LEARNING_SUGGESTIONS,
  MAKE_DECISION_MODAL,
  OPTIONS,
  SELECT_DEFECT_MANUALLY,
} from '../constants';
import { OptionsStepForm } from './optionsStepForm';
import styles from './makeDecisionModal.scss';

const cx = classNames.bind(styles);

const TABS_ID = {
  [MACHINE_LEARNING_SUGGESTIONS]: 0,
  [COPY_FROM_HISTORY_LINE]: 1,
  [SELECT_DEFECT_MANUALLY]: 2,
};

const MakeDecision = ({ data }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const btsIntegrations = useSelector(availableBtsIntegrationsSelector);
  const isBtsPluginsExist = useSelector(isBtsPluginsExistSelector);
  const enabledBtsPlugins = useSelector(enabledBtsPluginsSelector);
  const historyItems = useSelector(historyItemsSelector);
  const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);
  const isBulkOperation = data.items && data.items.length > 1;
  const itemData = isBulkOperation ? data.items : data.items[0];
  const [modalState, setModalState] = useState({
    source: {
      issue: isBulkOperation ? {} : itemData.issue,
    },
    decisionType: SELECT_DEFECT_MANUALLY,
    issueActionType: '',
  });
  const [accordionTabsState, setAccordionTabsState] = useState({
    [TABS_ID[MACHINE_LEARNING_SUGGESTIONS]]: false,
    [TABS_ID[COPY_FROM_HISTORY_LINE]]: false,
    [TABS_ID[SELECT_DEFECT_MANUALLY]]: true,
  });
  const [step, setFormStep] = useState(CONFIGURATION);
  const [modalHasChanges, setModalHasChanges] = useState(false);

  useEffect(() => {
    setModalHasChanges(
      (isBulkOperation
        ? !isEmptyObject(modalState.source.issue)
        : modalState.decisionType === SELECT_DEFECT_MANUALLY &&
          !isEqual(itemData.issue, modalState.source.issue)) ||
        modalState.decisionType === COPY_FROM_HISTORY_LINE ||
        !!modalState.issueActionType,
    );
  }, [modalState]);

  const collapseTabsExceptCurr = (currentTab) => {
    const newTabsState = Object.fromEntries(
      Object.entries(accordionTabsState).map(([id]) =>
        +id === currentTab ? [id, true] : [id, false],
      ),
    );
    setAccordionTabsState(newTabsState);
  };
  const handleIgnoreAnalyzerChange = (value) => {
    const issue =
      modalState.decisionType === SELECT_DEFECT_MANUALLY
        ? { ...modalState.source.issue, ignoreAnalyzer: value }
        : { ...itemData.issue, ignoreAnalyzer: value };
    setModalState({
      ...modalState,
      source: { issue },
      decisionType: SELECT_DEFECT_MANUALLY,
    });
    collapseTabsExceptCurr(TABS_ID[SELECT_DEFECT_MANUALLY]);
  };
  const prepareDataToSend = (isIssueAction = false) => {
    if (isBulkOperation) {
      const { items } = data;
      return items.map((item) => ({
        ...(isIssueAction ? item : {}),
        testItemId: item.id,
        issue: {
          ...item.issue,
          ...modalState.source.issue,
          autoAnalyzed: false,
        },
      }));
    }
    return [
      {
        ...(isIssueAction ? itemData : {}),
        testItemId: itemData.id,
        issue: { ...modalState.source.issue, autoAnalyzed: false },
      },
    ];
  };
  const saveDefect = () => {
    const { fetchFunc } = data;
    const issues = prepareDataToSend();
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

  const moveToOptionsStep = () => {
    setFormStep(OPTIONS);
  };

  const moveToConfigurationStep = () => {
    setFormStep(CONFIGURATION);
  };

  const handlePostIssue = () => {
    const { postIssueEvents } = data.eventsInfo;
    dispatch(
      postIssueAction(prepareDataToSend(true), {
        fetchFunc: data.fetchFunc,
        eventsInfo: postIssueEvents,
      }),
    );
  };
  const handleLinkIssue = () => {
    const { linkIssueEvents } = data.eventsInfo;
    dispatch(
      linkIssueAction(prepareDataToSend(true), {
        fetchFunc: data.fetchFunc,
        eventsInfo: linkIssueEvents,
      }),
    );
  };
  const handleUnlinkIssue = () => {
    const { unlinkIssueEvents } = data.eventsInfo;
    const selectedItems = isBulkOperation
      ? prepareDataToSend(true).filter((item) => item.issue.externalSystemIssues.length > 0)
      : prepareDataToSend(true);
    dispatch(
      unlinkIssueAction(selectedItems, {
        fetchFunc: data.fetchFunc,
        eventsInfo: unlinkIssueEvents,
      }),
    );
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
        id: 0,
        label: formatMessage(actionMessages[POST_ISSUE]),
        hint: isPostIssueUnavailable ? issueTitle : '',
        noteMsg: formatMessage(messages.postIssueNote),
        icon: PlusIcon,
        onClick: () => {
          setIssueActionType(POST_ISSUE);
          collapseTabsExceptCurr(TABS_ID.selectDefectManually);
        },
        disabled: isPostIssueUnavailable,
        isSelected: modalState.issueActionType === POST_ISSUE,
      },
      {
        id: 1,
        label: formatMessage(actionMessages[LINK_ISSUE]),
        hint: btsIntegrations.length ? '' : issueTitle,
        noteMsg: formatMessage(messages.linkIssueNote),
        icon: PlusIcon,
        onClick: () => {
          setIssueActionType(LINK_ISSUE);
          collapseTabsExceptCurr(TABS_ID.selectDefectManually);
        },
        disabled: !btsIntegrations.length,
        isSelected: modalState.issueActionType === LINK_ISSUE,
      },
    ];

    if (
      isBulkOperation
        ? itemData.some((item) => item.issue.externalSystemIssues.length > 0)
        : itemData.issue && itemData.issue.externalSystemIssues.length > 0
    ) {
      actionButtonItems.push({
        id: 2,
        label: formatMessage(actionMessages[UNLINK_ISSUE]),
        noteMsg: formatMessage(messages.unlinkIssueNote),
        icon: UnlinkIcon,
        onClick: () => {
          setIssueActionType(UNLINK_ISSUE);
          collapseTabsExceptCurr(TABS_ID[SELECT_DEFECT_MANUALLY]);
        },
        isSelected: modalState.issueActionType === UNLINK_ISSUE,
      });
    }
    return actionButtonItems;
  };
  const preparedHistoryLineItems = historyItems.filter(
    (item) => item.issue && item.id !== itemData.id,
  );
  const selectHistoryLineItem = (itemId) => {
    if (itemId) {
      const historyItem = preparedHistoryLineItems.find((item) => item.id === itemId);
      setModalState({
        ...modalState,
        source: historyItem,
        decisionType: COPY_FROM_HISTORY_LINE,
        issueActionType: '',
      });
      collapseTabsExceptCurr(TABS_ID[COPY_FROM_HISTORY_LINE]);
    } else {
      setModalState({ ...modalState, source: { issue: itemData.issue }, decisionType: '' });
    }
  };
  const selectDefectTypeManually = (value) => {
    const issue =
      modalState.decisionType === SELECT_DEFECT_MANUALLY
        ? { ...modalState.source.issue, issueType: value }
        : { ...itemData.issue, issueType: value };
    setModalState({
      ...modalState,
      source: { issue },
      decisionType: SELECT_DEFECT_MANUALLY,
    });
    collapseTabsExceptCurr(TABS_ID[SELECT_DEFECT_MANUALLY]);
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
  const applyChangesImmediately = () => {
    if (isBulkOperation) {
      modalHasChanges && !isEmptyObject(modalState.source.issue) && saveDefect();
    } else {
      modalHasChanges && !isEqual(itemData.issue, modalState.source.issue) && saveDefect();
    }
    modalState.decisionType === COPY_FROM_HISTORY_LINE &&
      isEqual(itemData.issue, modalState.source.issue) &&
      dispatch(hideModalAction());
    modalState.issueActionType && dispatch(hideModalAction()) && getIssueAction();
  };
  const renderHeaderElements = () => {
    return (
      <>
        {!isBulkOperation && (
          <GhostButton
            onClick={applyChangesImmediately}
            disabled={!modalHasChanges}
            transparentBorder
            transparentBackground
            appearance="topaz"
          >
            {formatMessage(messages.applyImmediately)}
          </GhostButton>
        )}
        <GhostButton
          onClick={isBulkOperation ? applyChangesImmediately : moveToOptionsStep}
          disabled={isBulkOperation ? !modalHasChanges : false}
          color="''"
          appearance="topaz"
        >
          {isBulkOperation
            ? formatMessage(messages.applyTo, {
                itemsCount: itemData.length,
              })
            : formatMessage(messages.applyWithOptions)}
        </GhostButton>
      </>
    );
  };
  const accordionData = () => {
    const tabsData = [
      {
        id: TABS_ID[MACHINE_LEARNING_SUGGESTIONS],
        shouldShow: !isBulkOperation,
        title: (
          <div title={formatMessage(messages.disabledTabTooltip)}>
            {formatMessage(messages.machineLearningSuggestions)}
          </div>
        ),
        content: null,
      },
      {
        id: TABS_ID[SELECT_DEFECT_MANUALLY],
        shouldShow: true,
        title: formatMessage(messages.selectDefectTypeManually),
        content: (
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
            />
            <ActionButtonsBar actionItems={getActionItems()} />
          </>
        ),
      },
    ];
    if (preparedHistoryLineItems.length > 0) {
      tabsData.splice(1, 0, {
        id: TABS_ID[COPY_FROM_HISTORY_LINE],
        shouldShow: true,
        title: formatMessage(messages.copyFromHistoryLine),
        content: (
          <>
            <div className={cx('execution-header')}>
              <span>{`${formatMessage(messages.execution)} #`}</span>
              <span>{formatMessage(messages.defectType)}</span>
            </div>
            {preparedHistoryLineItems.map((item) => (
              <div className={cx('execution-item')} key={item.id}>
                <ExecutionInfo
                  item={item}
                  selectedItem={modalState.source.id}
                  selectItem={selectHistoryLineItem}
                />
              </div>
            ))}
          </>
        ),
      });
    }
    return tabsData;
  };

  const renderOptionsStepHeaderElements = () => {
    return (
      <>
        <GhostButton
          onClick={moveToConfigurationStep}
          disabled={false}
          icon={LeftArrowIcon}
          transparentBorder
          transparentBackground
          appearance="topaz"
        >
          {formatMessage(messages.backToConfiguration)}
        </GhostButton>
        <GhostButton
          onClick={applyChangesImmediately}
          disabled={!modalHasChanges}
          color="''"
          appearance="topaz"
        >
          {formatMessage(messages.apply)}
        </GhostButton>
      </>
    );
  };

  const hotKeyAction = {
    ctrlEnter: () => applyChangesImmediately(),
  };

  return (
    <DarkModalLayout
      title={
        isBulkOperation
          ? formatMessage(messages.bulkOperationDecision)
          : formatMessage(messages.decisionForTest, {
              launchNumber: itemData.launchNumber && `#${itemData.launchNumber}`,
            })
      }
      renderHeaderElements={
        step === CONFIGURATION ? renderHeaderElements : renderOptionsStepHeaderElements
      }
      modalHasChanges={modalHasChanges}
      hotKeyAction={hotKeyAction}
      modalNote={formatMessage(messages.modalNote)}
    >
      {step === CONFIGURATION ? (
        <Accordion
          renderedData={accordionData()}
          tabsStateOutside={{
            state: accordionTabsState,
            setState: setAccordionTabsState,
          }}
        />
      ) : (
        <OptionsStepForm accordionData={accordionData} />
      )}
    </DarkModalLayout>
  );
};
MakeDecision.propTypes = {
  data: PropTypes.shape({
    item: PropTypes.object,
    items: PropTypes.array,
    fetchFunc: PropTypes.func,
    eventsInfo: PropTypes.object,
  }).isRequired,
};
export const MakeDecisionModal = withModal(MAKE_DECISION_MODAL)(MakeDecision);
