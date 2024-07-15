/*
 * Copyright 2024 EPAM Systems
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
} from 'controllers/project';
import { userRolesSelector } from 'controllers/pages';
import {
  fetchProjectNotificationsAction,
  updateNotificationStateAction,
} from 'controllers/project/actionCreators';
import { notificationPluginsSelector } from 'controllers/plugins/selectors';
import { projectNotificationsLoadingSelector } from 'controllers/project/selectors';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PROJECT_SETTINGS_NOTIFICATIONS_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { Toggle } from 'componentLibrary/toggle';
import { FieldElement, FormattedDescription } from '../elements';
import { Layout } from '../layout';
import { SettingsPageContent } from '../settingsPageContent';
import styles from './notifications.scss';
import { messages } from './messages';
import { NotificationsFooter } from './footer';
import { RuleGroup } from './ruleGroup';

const cx = classNames.bind(styles);

const TooltipComponent = ({ tooltip }) => <p>{tooltip}</p>;
TooltipComponent.propTypes = {
  tooltip: PropTypes.string.isRequired,
};

export const Notifications = () => {
  const allNotificationPlugins = useSelector(notificationPluginsSelector);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const userRoles = useSelector(userRolesSelector);
  const isAllNotificationsEnabled = useSelector(projectNotificationsStateSelector);
  const notifications = useSelector(projectNotificationsSelector);
  const loading = useSelector(projectNotificationsLoadingSelector);
  const isReadOnly = !canUpdateSettings(userRoles);

  useEffect(() => {
    dispatch(fetchProjectNotificationsAction());
  }, []);

  const toggleNotificationsEnabled = (isEnabled) => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.SWITCH_ALL_NOTIFICATIONS(isEnabled));
    dispatch(updateNotificationStateAction(isEnabled));
  };
  // separate notifications by types
  const notificationRulesByTypes = Object.groupBy(notifications, (rule) => rule.type);

  return loading ? (
    <SpinningPreloader />
  ) : (
    <SettingsPageContent>
      <Layout
        description={<FormattedDescription content={formatMessage(messages.tabDescription)} />}
      >
        <FieldElement
          className={cx('fieldElement')}
          withoutProvider
          description={formatMessage(messages.toggleNote)}
          dataAutomationId="notificationsEnabledCheckbox"
        >
          <div className={cx('toggle')}>
            <Toggle
              disabled={isReadOnly}
              value={isAllNotificationsEnabled}
              onChange={(e) => toggleNotificationsEnabled(e.target.checked)}
            >
              <span className={cx('name-wrapper')}>{formatMessage(messages.allNotifications)}</span>
            </Toggle>
          </div>
        </FieldElement>
      </Layout>
      {allNotificationPlugins.map((item) => (
        <RuleGroup
          ruleDescription={item.details.ruleDescription}
          ruleFields={item.details.ruleFields}
          key={`rule-section-${item.name}`}
          pluginName={item.name}
          isPluginEnabled={item.enabled}
          rules={notificationRulesByTypes[item.name] || []}
        />
      ))}
      <NotificationsFooter />
    </SettingsPageContent>
  );
};
