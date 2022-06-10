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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { useIntl } from 'react-intl';
import { formatAttribute } from 'common/utils/attributeUtils';
import { canUpdateSettings } from 'common/utils/permissions';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  projectNotificationsCasesSelector,
  projectNotificationsEnabledSelector,
} from 'controllers/project';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { EmptyStatePage } from 'pages/inside/projectSettingsPageContainer/content/emptyStatePage';
import { RuleListHeader } from 'pages/common/settingsPage/ruleListHeader';
import { RuleList } from 'pages/common/settingsPage/ruleList';
import styles from './notifications.scss';
import {
  ATTRIBUTES_FIELD_KEY,
  DEFAULT_CASE_CONFIG,
  LAUNCH_NAMES_FIELD_KEY,
  RECIPIENTS_FIELD_KEY,
  SEND_CASE_FIELD_KEY,
} from './constants';
import { convertNotificationCaseForSubmission } from './utils';
import { messages } from './messages';

const cx = classNames.bind(styles);
const ruleFieldsConfig = {
  [RECIPIENTS_FIELD_KEY]: {
    title: messages.recipientsLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${item}`, ''),
  },
  [SEND_CASE_FIELD_KEY]: {
    title: messages.inCaseLabel,
    dataFormatter: (data, formatMessage) =>
      messages[data] ? formatMessage(messages[data]) : messages[data],
  },
  [LAUNCH_NAMES_FIELD_KEY]: {
    title: messages.launchNamesLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${item}`, ''),
  },
  [ATTRIBUTES_FIELD_KEY]: {
    title: messages.attributesLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${formatAttribute(item)}`, ''),
  },
};

export const Notifications = ({ updateNotificationsConfig }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const projectRole = useSelector(activeProjectRoleSelector);
  const userRole = useSelector(userAccountRoleSelector);
  const enabled = useSelector(projectNotificationsEnabledSelector);
  const cases = useSelector(projectNotificationsCasesSelector);
  const isEmailIntegrationAvailable = useSelector(isEmailIntegrationAvailableSelector);

  const isAbleToEditNotificationCaseList = () => canUpdateSettings(userRole, projectRole);

  const isAbleToEditNotificationsEnableForm = () =>
    canUpdateSettings(userRole, projectRole) && isEmailIntegrationAvailable;

  const toggleNotificationsEnabled = (isEnabled) => {
    trackEvent(SETTINGS_PAGE_EVENTS.EDIT_INPUT_NOTIFICATIONS);
    updateNotificationsConfig({ enabled: isEnabled });
  };

  const confirmAddCase = (notificationCase) => {
    const newCases = [...cases, notificationCase].map(convertNotificationCaseForSubmission);
    updateNotificationsConfig({ cases: newCases });
  };

  const confirmEditCase = (id, notificationCase) => {
    const updatedCases = [...cases];
    updatedCases.splice(id, 1, notificationCase);
    const newCases = cases.map(convertNotificationCaseForSubmission);
    updateNotificationsConfig({ cases: newCases });
  };

  const confirmDeleteCase = (id) => {
    const newCases = cases
      .filter((item, index) => index !== id)
      .map(convertNotificationCaseForSubmission);
    updateNotificationsConfig({ cases: newCases });
  };

  const addNotificationCase = () => {
    trackEvent(SETTINGS_PAGE_EVENTS.ADD_RULE_BTN_NOTIFICATIONS);
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          onSave: confirmAddCase,
          notification: DEFAULT_CASE_CONFIG,
          isNewCase: true,
        },
      }),
    );
  };

  const onEdit = (notificationCase, id) => {
    trackEvent(SETTINGS_PAGE_EVENTS.EDIT_RULE_NOTIFICATIONS);
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          onSave: (data) => confirmEditCase(id, data),
          notificationCase,
        },
      }),
    );
  };

  const onDelete = (notificationCase, id) => {
    trackEvent(SETTINGS_PAGE_EVENTS.CLICK_ON_DELETE_RULE_NOTIFICATIONS);
    dispatch(
      showModalAction({
        id: 'deleteNotificationModal',
        data: {
          id,
          onSave: () => confirmDeleteCase(id),
          eventsInfo: {
            closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_DELETE_RULE_NOTIFICATIONS,
            cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_DELETE_RULE_NOTIFICATIONS,
            deleteBtn: SETTINGS_PAGE_EVENTS.DELETE_RULE_NOTIFICATIONS,
          },
        },
      }),
    );
  };

  const onToggleHandler = (isEnabled, notificationCase, id) => {
    const updatedCases = [...cases];
    updatedCases.splice(id, 1, { ...notificationCase, enabled: isEnabled });
    const newCases = updatedCases.map(convertNotificationCaseForSubmission);

    trackEvent(
      isEnabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_NOTIFICATION_RULE_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_NOTIFICATION_RULE_SWITCHER,
    );
    updateNotificationsConfig({ cases: newCases });
  };

  const getPanelTitle = () => formatMessage(messages.controlPanelName);

  const getListItemContentData = (notificationCase) => {
    const notification = convertNotificationCaseForSubmission(notificationCase);

    return Object.keys(notification)
      .map((fieldKey) => {
        const fieldInfo = ruleFieldsConfig[fieldKey];
        const fieldData = notification[fieldKey];

        return {
          key: fieldInfo ? formatMessage(fieldInfo.title) : null,
          value: fieldInfo && fieldData ? fieldInfo.dataFormatter(fieldData, formatMessage) : null,
        };
      })
      .filter((item) => item.key && item.value);
  };

  const readOnlyNotificationsEnableForm = !isAbleToEditNotificationsEnableForm();
  const readOnlyNotificationCaseList = !isAbleToEditNotificationCaseList();
  const headerMessages = {
    toggleLabel: formatMessage(messages.toggleLabel),
    toggleNote: formatMessage(messages.toggleNote),
    create: formatMessage(messages.create),
  };
  const titleMessage = !isEmailIntegrationAvailable ? formatMessage(messages.title) : '';

  return (
    <div className={cx('notifications-tab')}>
      {cases.length ? (
        <Fragment>
          <RuleListHeader
            readOnly={readOnlyNotificationsEnableForm}
            messages={headerMessages}
            switcherValue={enabled}
            titleMessage={titleMessage}
            onAddItem={addNotificationCase}
            onChangeSwitcher={toggleNotificationsEnabled}
          />
          <RuleList
            readOnly={readOnlyNotificationCaseList}
            data={cases}
            onToggle={onToggleHandler}
            onDelete={onDelete}
            onEdit={onEdit}
            getPanelTitle={getPanelTitle}
            getListItemContentData={getListItemContentData}
          />
        </Fragment>
      ) : (
        <EmptyStatePage
          title={formatMessage(messages.noItemsMessage)}
          description={formatMessage(messages.notificationsInfo)}
          buttonName={formatMessage(messages.create)}
          documentationLink={
            'https://reportportal.io/docs/Project-configuration%3Ee-mail-notifications'
          }
          disableButton={readOnlyNotificationCaseList}
          handleButton={addNotificationCase}
        />
      )}
    </div>
  );
};
Notifications.propTypes = {
  enabled: PropTypes.bool,
  cases: PropTypes.array,
  updateNotificationsConfig: PropTypes.func,
  showModal: PropTypes.func,
  projectRole: PropTypes.string,
  userRole: PropTypes.string,
  isEmailIntegrationAvailable: PropTypes.bool,
};
Notifications.defaultProps = {
  enabled: false,
  cases: [],
  showModal: () => {},
  updateNotificationsConfig: () => {},
  projectRole: '',
  userRole: '',
  isEmailIntegrationAvailable: true,
};
