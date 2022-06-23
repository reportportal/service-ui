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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { useIntl } from 'react-intl';
import { canUpdateSettings } from 'common/utils/permissions';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  projectNotificationsCasesSelector,
  projectNotificationsStateSelector,
  updateProjectNotificationsConfigAction,
  addProjectNotificationAction,
} from 'controllers/project';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { EmptyStatePage } from 'pages/inside/projectSettingsPageContainer/content/emptyStatePage';
import { Button } from 'componentLibrary/button';
import { Checkbox } from 'componentLibrary/checkbox';
import { updateNotificationStateAction } from 'controllers/project/actionCreators';
import PencilIcon from 'common/img/pencil-inline.svg';
import BinIcon from 'common/img/bin-inline.svg';
import CopyIcon from 'common/img/copy-inline.svg';
import { RuleList } from '../elements/ruleList';
import { Layout } from '../layout';
import styles from './notifications.scss';
import { DEFAULT_CASE_CONFIG } from './constants';
import { convertNotificationCaseForSubmission } from './utils';
import { messages } from './messages';
import { FieldElement } from '../elements';
import { NotificationRuleContent } from '../elements/notificationRuleContent';

const cx = classNames.bind(styles);

export const Notifications = ({ setHeaderTitleNode }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const projectRole = useSelector(activeProjectRoleSelector);
  const userRole = useSelector(userAccountRoleSelector);
  const enabled = useSelector(projectNotificationsStateSelector);
  const cases = useSelector(projectNotificationsCasesSelector);
  const isEmailIntegrationAvailable = useSelector(isEmailIntegrationAvailableSelector);

  const isAbleToEditNotificationList = () => canUpdateSettings(userRole, projectRole);
  const isAbleToEditNotificationsEnableForm = () =>
    canUpdateSettings(userRole, projectRole) && isEmailIntegrationAvailable;

  const toggleNotificationsEnabled = (isEnabled) => {
    trackEvent(SETTINGS_PAGE_EVENTS.EDIT_INPUT_NOTIFICATIONS);
    dispatch(updateNotificationStateAction(isEnabled));
  };

  const confirmAddCase = (notificationCase) => {
    const notification = convertNotificationCaseForSubmission(notificationCase);
    dispatch(addProjectNotificationAction(notification));
  };

  const confirmEditCase = (id, notificationCase) => {
    const updatedCases = [...cases];
    updatedCases.splice(id, 1, notificationCase);
    const newCases = cases.map(convertNotificationCaseForSubmission);
    // TODO: use new endpoint
    dispatch(updateProjectNotificationsConfigAction({ cases: newCases }));
  };

  const confirmDeleteCase = (id) => {
    const newCases = cases
      .filter((item, index) => index !== id)
      .map(convertNotificationCaseForSubmission);
    // TODO: use new endpoint
    dispatch(updateProjectNotificationsConfigAction({ cases: newCases }));
  };

  const onAdd = () => {
    trackEvent(SETTINGS_PAGE_EVENTS.ADD_RULE_BTN_NOTIFICATIONS);
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          onSave: confirmAddCase,
          notification: DEFAULT_CASE_CONFIG,
          notifications: cases,
          isNewCase: true,
        },
      }),
    );
  };

  const onEdit = (notification, id) => {
    trackEvent(SETTINGS_PAGE_EVENTS.EDIT_RULE_NOTIFICATIONS);
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          onSave: (data) => confirmEditCase(id, data),
          notification,
          notifications: cases,
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

  useEffect(() => {
    setHeaderTitleNode(
      <span className={cx('button')} onClick={onAdd}>
        <Button disabled={!isAbleToEditNotificationList()}>{formatMessage(messages.create)}</Button>
      </span>,
    );

    return () => setHeaderTitleNode(null);
  });

  const onToggleHandler = (isEnabled, notificationCase, id) => {
    const updatedCases = [...cases];
    updatedCases.splice(id, 1, { ...notificationCase, enabled: isEnabled });
    const newCases = updatedCases.map(convertNotificationCaseForSubmission);

    trackEvent(
      isEnabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_NOTIFICATION_RULE_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_NOTIFICATION_RULE_SWITCHER,
    );
    // TODO: use new endpoint
    dispatch(updateProjectNotificationsConfigAction({ cases: newCases }));
  };

  const readOnlyNotificationsEnableForm = !isAbleToEditNotificationsEnableForm();
  const readOnlyNotificationList = !isAbleToEditNotificationList();

  const actions = [
    {
      icon: CopyIcon,
    },
    {
      icon: PencilIcon,
      handler: onEdit,
    },
    {
      icon: BinIcon,
      handler: onDelete,
    },
  ];

  return (
    <>
      {cases.length ? (
        <>
          <Layout description={formatMessage(messages.tabDescription)}>
            <FieldElement withoutProvider description={formatMessage(messages.toggleNote)}>
              <Checkbox
                disabled={readOnlyNotificationsEnableForm}
                value={enabled}
                onChange={(e) => toggleNotificationsEnabled(e.target.checked)}
              >
                {formatMessage(messages.toggleLabel)}
              </Checkbox>
            </FieldElement>
          </Layout>
          <div className={cx('notifications-container')}>
            <RuleList
              disabled={readOnlyNotificationList}
              data={cases.map((item) => ({ name: item.ruleName, ...item }))}
              actions={actions}
              onToggle={onToggleHandler}
              ruleItemContent={NotificationRuleContent}
            />
          </div>
        </>
      ) : (
        <EmptyStatePage
          title={formatMessage(messages.noItemsMessage)}
          description={formatMessage(messages.notificationsInfo)}
          buttonName={formatMessage(messages.create)}
          documentationLink={
            'https://reportportal.io/docs/Project-configuration%3Ee-mail-notifications'
          }
          disableButton={readOnlyNotificationList}
          handleButton={onAdd}
        />
      )}
    </>
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
  setHeaderTitleNode: PropTypes.func.isRequired,
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
