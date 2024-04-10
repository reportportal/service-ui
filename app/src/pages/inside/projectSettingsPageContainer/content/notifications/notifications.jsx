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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { useIntl } from 'react-intl';
import { canUpdateSettings } from 'common/utils/permissions';
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
import { Button } from 'componentLibrary/button';
import {
  fetchProjectNotificationsAction,
  updateNotificationStateAction,
} from 'controllers/project/actionCreators';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import BinIcon from 'common/img/newIcons/bin-inline.svg';
import CopyIcon from 'common/img/newIcons/copy-inline.svg';
import plusIcon from 'common/img/plus-button-inline.svg';
import { notificationPluginsSelector } from 'controllers/plugins/selectors';
import { projectNotificationsLoadingSelector } from 'controllers/project/selectors';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PROJECT_SETTINGS_NOTIFICATIONS_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { Toggle } from 'componentLibrary/toggle';

import {
  RuleList,
  FieldElement,
  NotificationRuleContent,
  FormattedDescription,
  MODAL_ACTION_TYPE_ADD,
  MODAL_ACTION_TYPE_EDIT,
  MODAL_ACTION_TYPE_COPY,
} from '../elements';
import { Layout } from '../layout';
import { SettingsPageContent } from '../settingsPageContent';
import styles from './notifications.scss';
import { DEFAULT_CASE_CONFIG } from './constants';
import { convertNotificationCaseForSubmission } from './utils';
import { messages } from './messages';
import { EmptyRuleState } from './emptyRuleState';
import { Footer } from './footer';

const cx = classNames.bind(styles);
const COPY_POSTFIX = '_copy';

const TooltipComponent = ({ tooltip }) => <p>{tooltip}</p>;
TooltipComponent.propTypes = {
  tooltip: PropTypes.string.isRequired,
};

export const Notifications = () => {
  const allNotificationPlugins = useSelector(notificationPluginsSelector);
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

  const confirmAdd = (newNotification) => {
    const notification = convertNotificationCaseForSubmission(newNotification);
    dispatch(addProjectNotificationAction(notification));
  };

  const confirmEdit = (notification) => {
    dispatch(
      updateProjectNotificationAction(
        convertNotificationCaseForSubmission({
          ...notification,
          name: notification.ruleName,
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
          actionType: MODAL_ACTION_TYPE_ADD,
          onSave: confirmAdd,
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
          actionType: MODAL_ACTION_TYPE_EDIT,
          onSave: confirmEdit,
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
          actionType: MODAL_ACTION_TYPE_COPY,
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
      dataAutomationId: 'duplicateNotificationRuleIcon',
    },
    {
      icon: PencilIcon,
      handler: onEdit,
      dataAutomationId: 'editNotificationRuleIcon',
    },
    {
      icon: BinIcon,
      handler: onDelete,
      dataAutomationId: 'deleteNotificationRuleIcon',
    },
  ];

  const handleRuleItemClick = (isShown) => {
    if (isShown) {
      trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_TO_EXPAND_NOTIFICATIONS_DETAILS);
    }
  };

  if (loading) {
    return <SpinningPreloader />;
  }
  // separate notifications by types
  const notificationRulesByTypes = Object.groupBy(notifications, (rule) => rule.type);

  return (
    <SettingsPageContent>
      <Layout
        description={<FormattedDescription content={formatMessage(messages.tabDescription)} />}
      >
        <FieldElement
          withoutProvider
          description={formatMessage(messages.toggleNote)}
          dataAutomationId="notificationsEnabledCheckbox"
        >
          <div className={cx('toggle')}>
            <Toggle
              disabled={isReadOnly}
              value={enabled}
              onChange={(e) => toggleNotificationsEnabled(e.target.checked)}
              dataAutomationId="enabledToggle"
            >
              <span className={cx('name-wrapper')}>
                <i className={cx('name')}> {formatMessage(messages.allNotifications)}</i>
              </span>
            </Toggle>
          </div>
        </FieldElement>
      </Layout>
      {/* render extension: including name, description and subRules */}
      {allNotificationPlugins.map((item, id) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={cx('rule-section')} key={`rule-section-${id}`}>
          <Layout description={''}>
            <FieldElement
              withoutProvider
              description={formatMessage(messages.typeDescription, { type: item.name })}
            >
              <div className={cx('toggle')}>
                <Toggle
                  disabled={isReadOnly}
                  value={enabled}
                  onChange={(e) => toggleNotificationsEnabled(e.target.checked)}
                  dataAutomationId="enabledToggle"
                >
                  <span className={cx('name-wrapper')}>
                    <i className={cx('types-name')}> {item.name}</i>
                  </span>
                </Toggle>
              </div>
            </FieldElement>
            <div className={cx('notifications-container')}>
              {/* notification rules for each extension */}
              {notificationRulesByTypes[item.name]?.length > 0 ? (
                <>
                  {/* Add disabled/noneIntegration case */}
                  <RuleList
                    disabled={isReadOnly}
                    data={notificationRulesByTypes[item.name].map((rule) => ({
                      name: rule.ruleName,
                      ...rule,
                    }))}
                    actions={actions}
                    onToggle={onToggleHandler}
                    ruleItemContent={NotificationRuleContent}
                    handleRuleItemClick={handleRuleItemClick}
                    dataAutomationId="notificationsRulesList"
                  />
                  <Button
                    customClassName={cx('add-rule')}
                    onClick={onAdd}
                    variant={'text'}
                    startIcon={plusIcon}
                  >
                    {formatMessage(messages.addRule)}
                  </Button>
                </>
              ) : (
                <EmptyRuleState ruleName={item.name} onCreateClick={handleRuleItemClick} />
              )}
            </div>
          </Layout>
        </div>
      ))}
      <Footer />
    </SettingsPageContent>
  );
};
Notifications.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
};
