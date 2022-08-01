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
  projectNotificationsSelector,
  projectNotificationsStateSelector,
  updateProjectNotificationAction,
  deleteProjectNotificationAction,
  addProjectNotificationAction,
} from 'controllers/project';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { EmptyStatePage } from 'pages/inside/projectSettingsPageContainer/content/emptyStatePage';
import { Button } from 'componentLibrary/button';
import { Checkbox } from 'componentLibrary/checkbox';
import {
  fetchProjectNotificationsAction,
  updateNotificationStateAction,
} from 'controllers/project/actionCreators';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import BinIcon from 'common/img/newIcons/bin-inline.svg';
import CopyIcon from 'common/img/newIcons/copy-inline.svg';
import { projectNotificationsLoadingSelector } from 'controllers/project/selectors';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { RuleList, FieldElement, NotificationRuleContent } from '../elements';
import { PROJECT_SETTINGS_NOTIFICATIONS_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { Layout } from '../layout';
import styles from './notifications.scss';
import { DEFAULT_CASE_CONFIG } from './constants';
import { convertNotificationCaseForSubmission } from './utils';
import { messages } from './messages';

const cx = classNames.bind(styles);
const COPY_POSTFIX = '_copy';

export const Notifications = ({ setHeaderTitleNode }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const projectRole = useSelector(activeProjectRoleSelector);
  const userRole = useSelector(userAccountRoleSelector);
  const enabled = useSelector(projectNotificationsStateSelector);
  const notifications = useSelector(projectNotificationsSelector);
  const isEmailIntegrationAvailable = useSelector(isEmailIntegrationAvailableSelector);
  const loading = useSelector(projectNotificationsLoadingSelector);

  useEffect(() => {
    dispatch(fetchProjectNotificationsAction());
  }, []);

  const isAbleToEdit = () =>
    canUpdateSettings(userRole, projectRole) && isEmailIntegrationAvailable;

  const toggleNotificationsEnabled = (isEnabled) => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_CHECKBOX_AUTO_NOTIFICATIONS(isEnabled));
    dispatch(updateNotificationStateAction(isEnabled));
  };

  const confirmAdd = (withoutAttributes) => (newNotification) => {
    const notificationData = { ...newNotification };
    if (withoutAttributes) {
      notificationData.attributes = [];
    }
    const notification = convertNotificationCaseForSubmission(notificationData);
    dispatch(addProjectNotificationAction(notification));
  };

  const confirmEdit = (withoutAttributes) => (notification) => {
    dispatch(
      updateProjectNotificationAction(
        convertNotificationCaseForSubmission({
          ...notification,
          name: notification.ruleName,
          attributes: withoutAttributes ? [] : notification.attributes,
        }),
      ),
    );
  };

  const confirmDelete = (id) => {
    dispatch(deleteProjectNotificationAction(id));
  };

  const onAdd = () => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_CREATE_RULE_BUTTON);

    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          actionType: 'add',
          onSave: (withoutAttributes) => confirmAdd(withoutAttributes),
          notification: DEFAULT_CASE_CONFIG,
          notifications,
        },
      }),
    );
  };

  const onEdit = (notification) => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_ICON_EDIT_NOTIFICATIONS);

    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          actionType: 'edit',
          onSave: (withoutAttributes) => confirmEdit(withoutAttributes),
          notification,
          notifications,
        },
      }),
    );
  };

  const onDelete = (notification) => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_ICON_DELETE_NOTIFICATIONS);

    dispatch(
      showModalAction({
        id: 'deleteNotificationModal',
        data: {
          onSave: () => confirmDelete(notification.id),
        },
      }),
    );
  };

  const onCopy = (notification) => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_ICON_DUPLICATE_NOTIFICATIONS);

    const { id, ...newNotification } = notification;
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          actionType: 'copy',
          onSave: (withoutAttributes) => confirmAdd(withoutAttributes),
          notification: {
            ...newNotification,
            ruleName: notification.ruleName + COPY_POSTFIX,
          },
          notifications,
        },
      }),
    );
  };

  useEffect(() => {
    if (notifications.length > 0) {
      setHeaderTitleNode(
        <span className={cx('button')} onClick={onAdd}>
          <Button disabled={!isAbleToEdit()}>{formatMessage(messages.create)}</Button>
        </span>,
      );
    }

    return () => setHeaderTitleNode(null);
  }, [notifications]);

  const onToggleHandler = (isEnabled, notification) => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.SWITCH_NOTIFICATION_RULE(isEnabled));

    dispatch(
      updateProjectNotificationAction(
        convertNotificationCaseForSubmission({ ...notification, enabled: isEnabled }),
      ),
    );
  };

  const isReadOnly = !isAbleToEdit();

  const actions = [
    {
      icon: CopyIcon,
      handler: onCopy,
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

  const handleRuleItemClick = (isShown) => {
    if (isShown) {
      trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_TO_EXPAND_NOTIFICATIONS_DETAILS);
    }
  };

  const handleDocumentationClick = () => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_LINK_DOCUMENTATION);
  };

  if (loading) {
    return <SpinningPreloader />;
  }

  return (
    <>
      {notifications.length ? (
        <>
          <Layout description={formatMessage(messages.tabDescription)}>
            <FieldElement withoutProvider description={formatMessage(messages.toggleNote)}>
              <Checkbox
                disabled={isReadOnly}
                value={enabled}
                onChange={(e) => toggleNotificationsEnabled(e.target.checked)}
              >
                {formatMessage(messages.toggleLabel)}
              </Checkbox>
            </FieldElement>
          </Layout>
          <div className={cx('notifications-container')}>
            <RuleList
              disabled={isReadOnly}
              data={notifications.map((item) => ({ name: item.ruleName, ...item }))}
              actions={actions}
              onToggle={onToggleHandler}
              ruleItemContent={NotificationRuleContent}
              handleRuleItemClick={handleRuleItemClick}
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
          disableButton={isReadOnly}
          handleButton={onAdd}
          handleDocumentationClick={handleDocumentationClick}
        />
      )}
    </>
  );
};
Notifications.propTypes = {
  enabled: PropTypes.bool,
  notifications: PropTypes.array,
  updateNotificationsConfig: PropTypes.func,
  showModal: PropTypes.func,
  projectRole: PropTypes.string,
  userRole: PropTypes.string,
  isEmailIntegrationAvailable: PropTypes.bool,
  setHeaderTitleNode: PropTypes.func.isRequired,
};
Notifications.defaultProps = {
  enabled: false,
  notifications: [],
  showModal: () => {},
  updateNotificationsConfig: () => {},
  projectRole: '',
  userRole: '',
  isEmailIntegrationAvailable: true,
};
