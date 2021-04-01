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
import { ActionButtonsBar } from './actionButtonsBar';
import { messages } from './../messages';
import { MAKE_DECISION_MODAL } from '../constants';
import styles from './makeDecisionModal.scss';

const cx = classNames.bind(styles);

const MakeDecision = ({ data }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const btsIntegrations = useSelector(availableBtsIntegrationsSelector);
  const isBtsPluginsExist = useSelector(isBtsPluginsExistSelector);
  const enabledBtsPlugins = useSelector(enabledBtsPluginsSelector);
  const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);
  const itemsData = data.items && data.items.length === 1 ? data.items[0] : data.items;
  const itemData = data.item || itemsData;
  const [state, setState] = useState({
    issue: itemData.issue || null,
  });
  const [modalHasChanges, setModalHasChanges] = useState(false);
  const [issueAction, setIssueAction] = useState({});

  useEffect(() => {
    setModalHasChanges(
      state.issue
        ? !isEqual(itemData.issue, state.issue) || !isEmptyObject(issueAction)
        : false || !isEmptyObject(issueAction),
    );
  }, [state, issueAction]);

  const handleIgnoreAnalyzerChange = (value) => {
    const issue = { ...state.issue, ignoreAnalyzer: value };
    setState({
      ...state,
      issue,
    });
  };
  const selectDefectType = (value) => {
    const issue = { ...state.issue, issueType: value };
    setState({
      ...state,
      issue,
    });
  };
  const composeDataToSend = (isIssueAction = false) => {
    return [
      {
        ...(isIssueAction ? itemData : {}),
        testItemId: itemData.id,
        issue: state.issue,
      },
    ];
  };
  const prepareDataToSend = (isIssueAction = false) => {
    const { items } = data;

    const issues = items.map((item) => {
      const dataToSend = {
        ...(isIssueAction ? item : {}),
        testItemId: item.id,
        issue: {
          ...item.issue,
          autoAnalyzed: false,
          ...state.issue,
        },
      };
      return dataToSend;
    });
    return issues;
  };

  const saveDefect = () => {
    const { fetchFunc } = data;
    const issues = Array.isArray(itemData) ? prepareDataToSend() : composeDataToSend();
    const url = URLS.testItems(activeProject);

    fetch(url, {
      method: 'put',
      data: {
        issues,
      },
    })
      .then(() => {
        fetchFunc([{ testItemId: itemData.id, issue: state.issue }]);
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
  const applyChangesImmediately = () => {
    modalHasChanges && saveDefect();
    !modalHasChanges && !!issueAction.nextAction && dispatch(hideModalAction());
    issueAction.nextAction && issueAction.nextAction();
  };
  const renderHeaderElements = () => {
    return (
      <>
        <GhostButton
          onClick={applyChangesImmediately}
          disabled={!modalHasChanges}
          transparentBorder
          transparentBackground
          appearance="topaz"
        >
          {!Array.isArray(itemData) && formatMessage(messages.applyImmediately)}
        </GhostButton>
        <GhostButton
          onClick={applyChangesImmediately}
          disabled={Array.isArray(itemData) ? !modalHasChanges : true}
          color="''"
          appearance="topaz"
        >
          {Array.isArray(itemData)
            ? formatMessage(messages.applyTo, {
                itemsCount: itemData.length,
              })
            : formatMessage(messages.applyWithOptions)}
        </GhostButton>
      </>
    );
  };
  const handlePostIssue = () => {
    const { postIssueEvents } = data.eventsInfo;
    dispatch(
      postIssueAction(Array.isArray(itemData) ? prepareDataToSend(true) : composeDataToSend(true), {
        fetchFunc: data.fetchFunc,
        eventsInfo: postIssueEvents,
      }),
    );
  };
  const handleLinkIssue = () => {
    const { linkIssueEvents } = data.eventsInfo;
    dispatch(
      linkIssueAction(Array.isArray(itemData) ? prepareDataToSend(true) : composeDataToSend(true), {
        fetchFunc: data.fetchFunc,
        eventsInfo: linkIssueEvents,
      }),
    );
  };
  const handleUnlinkIssue = () => {
    const { unlinkIssueEvents } = data.eventsInfo;
    dispatch(
      unlinkIssueAction(
        Array.isArray(itemData) ? prepareDataToSend(true) : composeDataToSend(true),
        {
          fetchFunc: data.fetchFunc,
          eventsInfo: unlinkIssueEvents,
        },
      ),
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
    const actionButtonItems = [
      {
        id: 0,
        label: formatMessage(actionMessages[POST_ISSUE]),
        hint: isPostIssueUnavailable ? issueTitle : '',
        noteMsg: formatMessage(messages.postIssueNote),
        icon: PlusIcon,
        onClick: () => {
          if (issueAction.actionName === POST_ISSUE) {
            setIssueAction({});
          } else {
            setIssueAction({ actionName: POST_ISSUE, nextAction: handlePostIssue });
          }
        },
        disabled: isPostIssueUnavailable,
      },
      {
        id: 1,
        label: formatMessage(actionMessages[LINK_ISSUE]),
        hint: btsIntegrations.length ? '' : issueTitle,
        noteMsg: formatMessage(messages.linkIssueNote),
        icon: PlusIcon,
        onClick: () => {
          if (issueAction.actionName === LINK_ISSUE) {
            setIssueAction({});
          } else {
            setIssueAction({ actionName: LINK_ISSUE, nextAction: handleLinkIssue });
          }
        },
        disabled: !btsIntegrations.length,
      },
    ];

    if (itemData.issue && itemData.issue.externalSystemIssues.length > 0) {
      actionButtonItems.push({
        id: 2,
        label: formatMessage(actionMessages[UNLINK_ISSUE]),
        noteMsg: formatMessage(messages.unlinkIssueNote),
        icon: UnlinkIcon,
        onClick: () => {
          if (issueAction.actionName === UNLINK_ISSUE) {
            setIssueAction({});
          } else {
            setIssueAction({ actionName: UNLINK_ISSUE, nextAction: handleUnlinkIssue });
          }
        },
      });
    }
    return actionButtonItems;
  };
  const accordionData = [
    {
      id: 0,
      isActive: false,
      shouldShow: !Array.isArray(itemData),
      title: (
        <div title={formatMessage(messages.disabledTabTooltip)}>
          {formatMessage(messages.machineLearningSuggestions)}
        </div>
      ),
      content: null,
    },
    {
      id: 1,
      isActive: true,
      shouldShow: true,
      title: formatMessage(messages.selectDefectTypeManually),
      content: (
        <>
          {!Array.isArray(itemData) && (
            <InputSwitcher
              value={state.issue ? state.issue.ignoreAnalyzer : false}
              onChange={handleIgnoreAnalyzerChange}
              className={cx('ignore-analysis')}
              childrenFirst
              childrenClassName={cx('input-switcher-children')}
            >
              <span>{formatMessage(messages.ignoreAa)}</span>
            </InputSwitcher>
          )}
          <DefectTypeSelectorML
            selectDefectType={selectDefectType}
            selectedItem={state.issue ? state.issue.issueType : ''}
          />
          <ActionButtonsBar actionItems={getActionItems()} />
        </>
      ),
    },
  ];

  const hotKeyAction = {
    ctrlEnter: () => applyChangesImmediately(),
  };

  return (
    <DarkModalLayout
      title={
        Array.isArray(itemData)
          ? formatMessage(messages.bulkOperationDecision)
          : formatMessage(messages.decisionForTest, {
              launchNumber: itemData.launchNumber && `#${itemData.launchNumber}`,
            })
      }
      renderHeaderElements={renderHeaderElements}
      modalHasChanges={modalHasChanges}
      hotKeyAction={hotKeyAction}
      modalNote={formatMessage(messages.modalNote)}
    >
      <Accordion renderedData={accordionData} />
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
