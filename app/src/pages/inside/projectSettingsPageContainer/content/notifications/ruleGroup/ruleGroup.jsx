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

import { Layout } from 'pages/inside/projectSettingsPageContainer/content/layout';
import { Button, Toggle } from '@reportportal/ui-kit';
import addIcon from 'common/img/add-inline.svg';
import React from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import CopyIcon from 'common/img/newIcons/copy-inline.svg';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import BinIcon from 'common/img/newIcons/bin-inline.svg';
import AboutIcon from 'common/img/newIcons/icon-about-inline.svg';
import { PROJECT_SETTINGS_NOTIFICATIONS_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { showModalAction } from 'controllers/modal';
import { useTracking } from 'react-tracking';
import {
  addProjectNotificationAction,
  deleteProjectNotificationAction,
  updateProjectNotificationAction,
} from 'controllers/project';
import { canUpdateSettings } from 'common/utils/permissions';
import { useDispatch, useSelector } from 'react-redux';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { activeProjectSelector } from 'controllers/user';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { PROJECT_SETTINGS_TAB_PAGE, userRolesSelector } from 'controllers/pages';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { LinkComponent } from 'pages/inside/projectSettingsPageContainer/content/notifications/LinkComponent';
import arrowRightIcon from 'common/img/arrow-right-inline.svg';
import { updateNotificationStateAction } from 'controllers/project/actionCreators';
import { NOTIFICATIONS_PLUGIN_ATTRIBUTE_ENABLED_KEY } from 'controllers/project/constants';
import { projectPluginNotificationsStateSelector } from 'controllers/project/selectors';
import { EMAIL } from 'common/constants/pluginNames';
import { ruleField } from 'pages/inside/projectSettingsPageContainer/content/notifications/propTypes';
import { DEFAULT_CASE_CONFIG } from '../constants';
import { convertNotificationCaseForSubmission, flatRule, toCamelCase } from '../utils';
import {
  FieldElement,
  MODAL_ACTION_TYPE_ADD,
  MODAL_ACTION_TYPE_COPY,
  MODAL_ACTION_TYPE_EDIT,
  NotificationRuleContent,
  RuleList,
} from '../../elements';
import { messages } from '../messages';
import styles from './ruleGroup.scss';
import { EmptyRuleState } from '../emptyRuleState';

const cx = classNames.bind(styles);
const COPY_POSTFIX = '_copy';

const RuleItemDisabledTooltip = withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    width: '265px',
    placement: 'top',
    tooltipTriggerClass: cx('info-trigger'),
    dark: true,
  },
})(({ children }) => children);

export const RuleGroup = ({ pluginName, ruleDescription, rules, isPluginEnabled, ruleFields }) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();

  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const userRoles = useSelector(userRolesSelector);
  const isEmailIntegrationAvailable = useSelector(isEmailIntegrationAvailableSelector);
  const pluginNameInCamelCase = toCamelCase(pluginName);
  const isPluginNotificationsEnabled = useSelector(
    projectPluginNotificationsStateSelector(pluginNameInCamelCase),
  );

  const isUpdateSettingAvailable = canUpdateSettings(userRoles);
  const isReadOnly = !isUpdateSettingAvailable || !isPluginEnabled;
  const isActivationRequired = isUpdateSettingAvailable || rules?.length > 0;
  const isDisabledTooltipActivationRequired = !isPluginEnabled && isActivationRequired;
  const isEmailIntegrationRequired =
    pluginName === EMAIL && !isEmailIntegrationAvailable && isActivationRequired;

  const onToggleHandler = (isEnabled, notification) => {
    trackEvent(
      PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.SWITCH_NOTIFICATION_RULE(
        pluginNameInCamelCase,
        notification.id,
        isEnabled,
      ),
    );

    dispatch(
      updateProjectNotificationAction(
        convertNotificationCaseForSubmission({ ...notification, enabled: isEnabled }),
      ),
    );
  };

  const handleRuleItemClick = (isShown) => {
    if (isShown) {
      trackEvent(
        PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_TO_EXPAND_NOTIFICATIONS_DETAILS(
          pluginNameInCamelCase,
        ),
      );
    }
  };

  const togglePluginNotificationsEnabled = (isEnabled) => {
    trackEvent(
      PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.SWITCH_PLUGIN_NOTIFICATIONS(
        pluginNameInCamelCase,
        isEnabled,
      ),
    );

    dispatch(
      updateNotificationStateAction(
        isEnabled,
        NOTIFICATIONS_PLUGIN_ATTRIBUTE_ENABLED_KEY(pluginNameInCamelCase),
      ),
    );
  };
  const confirmAdd = (newNotification, eventParameters) => {
    const trackAddingEvent = (id) =>
      trackEvent(
        PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_SAVE_BUTTON_IN_MODAL({
          ...eventParameters,
          ruleId: id,
        }),
      );
    const notification = convertNotificationCaseForSubmission(newNotification);
    dispatch(addProjectNotificationAction(notification, trackAddingEvent));
  };

  const confirmDelete = (id) => {
    dispatch(deleteProjectNotificationAction(id));
  };

  const confirmEdit = (notification, eventParameters) => {
    trackEvent(
      PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_SAVE_BUTTON_IN_MODAL({
        ...eventParameters,
        ruleId: notification.id,
      }),
    );
    dispatch(
      updateProjectNotificationAction(
        convertNotificationCaseForSubmission({
          ...notification,
          name: notification.ruleName,
        }),
      ),
    );
  };

  const onAdd = () => {
    trackEvent(
      PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_CREATE_RULE_BUTTON(pluginNameInCamelCase),
    );

    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          type: pluginName,
          ruleFields,
          actionType: MODAL_ACTION_TYPE_ADD,
          onSave: confirmAdd,
          notification: DEFAULT_CASE_CONFIG,
          notifications: rules,
        },
      }),
    );
  };

  const onEdit = (notification) => {
    trackEvent(
      PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_ICON_EDIT_NOTIFICATIONS(pluginNameInCamelCase),
    );

    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          type: pluginName,
          ruleFields,
          actionType: MODAL_ACTION_TYPE_EDIT,
          onSave: confirmEdit,
          notification: flatRule(notification),
          notifications: rules,
        },
      }),
    );
  };

  const onDelete = (notification) => {
    trackEvent(
      PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_ICON_DELETE_NOTIFICATIONS(pluginNameInCamelCase),
    );

    dispatch(
      showModalAction({
        id: 'deleteNotificationModal',
        data: {
          onSave: () => confirmDelete(notification.id),
          type: pluginName,
        },
      }),
    );
  };
  const onCopy = (notification) => {
    trackEvent(
      PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_ICON_DUPLICATE_NOTIFICATIONS(
        pluginNameInCamelCase,
      ),
    );

    const { id, ...newNotification } = flatRule(notification);
    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          type: pluginName,
          actionType: MODAL_ACTION_TYPE_COPY,
          ruleFields,
          onSave: (withoutAttributes, eventParameters) =>
            confirmAdd(withoutAttributes, eventParameters),
          notification: {
            ...newNotification,
            ruleName: notification.ruleName + COPY_POSTFIX,
          },
          notifications: rules,
        },
      }),
    );
  };

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

  return (
    <div className={cx('rule-section')} data-automation-id={`${pluginNameInCamelCase}RulesSection`}>
      <Layout description={''} className={cx('rule-section-layout')}>
        <div className={cx('rule-section-header')}>
          <FieldElement
            className={cx('fieldElement')}
            withoutProvider
            description={
              pluginName === EMAIL
                ? formatMessage(messages.typeDescription, { type: EMAIL })
                : ruleDescription
            }
          >
            <div className={cx('toggle')}>
              <Toggle
                disabled={isReadOnly}
                value={isPluginNotificationsEnabled}
                onChange={(e) => togglePluginNotificationsEnabled(e.target.checked)}
              >
                <span className={cx('name-wrapper')}>
                  <i className={cx('capitalized')}>{pluginName}</i>
                </span>
              </Toggle>
            </div>
          </FieldElement>
          {isDisabledTooltipActivationRequired ? (
            <div className={cx('disabled-plugin')}>
              <p>
                <span className={cx('capitalized')}>{pluginName}</span>{' '}
                {formatMessage(messages.disabledPlugin, { pluginName })}
              </p>
              <RuleItemDisabledTooltip
                className={cx('info-tooltip')}
                tooltipContent={formatMessage(messages.disabledContactInfo)}
              >
                <i className={cx('icon', 'about-icon')}>{Parser(AboutIcon)}</i>
              </RuleItemDisabledTooltip>
            </div>
          ) : (
            isEmailIntegrationRequired && (
              <div className={cx('integrate-configurations')}>
                <p>{formatMessage(messages.notConfiguredIntegration)}</p>
                {isUpdateSettingAvailable && (
                  <LinkComponent
                    to={{
                      type: PROJECT_SETTINGS_TAB_PAGE,
                      payload: {
                        projectId: activeProject,
                        settingsTab: INTEGRATIONS,
                      },
                      meta: {
                        query: {
                          subPage: 'email',
                        },
                      },
                    }}
                    icon={arrowRightIcon}
                    event={PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_CONFIGURE_INTEGRATION_LINK}
                    target="_self"
                  >
                    {formatMessage(messages.configureIntegration)}
                  </LinkComponent>
                )}
              </div>
            )
          )}
        </div>

        <div className={cx('notifications-container')}>
          {rules?.length > 0 ? (
            <div className={cx('content-items')}>
              <RuleList
                disabled={isReadOnly}
                data={rules.map((rule) => ({
                  name: rule.ruleName,
                  ...rule,
                }))}
                actions={actions}
                onToggle={onToggleHandler}
                ruleItemContent={NotificationRuleContent}
                ruleItemContentProps={{ ruleFields }}
                handleRuleItemClick={handleRuleItemClick}
                dataAutomationId="notificationsRulesList"
                className={cx('rule-group-list')}
              />
              {isUpdateSettingAvailable && (
                <Button
                  className={cx('add-rule')}
                  onClick={onAdd}
                  variant={'text'}
                  icon={Parser(addIcon)}
                  data-automation-id="addRuleButton"
                >
                  {formatMessage(messages.addRule)}
                </Button>
              )}
            </div>
          ) : (
            isUpdateSettingAvailable && (
              <EmptyRuleState ruleName={pluginName} onCreateClick={onAdd} />
            )
          )}
        </div>
      </Layout>
    </div>
  );
};
const ruleShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  ruleName: PropTypes.string.isRequired,
  recipients: PropTypes.array.isRequired,
  sendCase: PropTypes.string.isRequired,
  launchNames: PropTypes.array,
  attributes: PropTypes.array,
  enabled: PropTypes.bool.isRequired,
  attributesOperator: PropTypes.string,
  informOwner: PropTypes.bool,
  type: PropTypes.string.isRequired,
});

RuleGroup.propTypes = {
  ruleDescription: PropTypes.string,
  pluginName: PropTypes.string.isRequired,
  rules: PropTypes.arrayOf(ruleShape),
  ruleFields: PropTypes.arrayOf(ruleField),
  isPluginEnabled: PropTypes.bool.isRequired,
};

RuleGroup.defaultProps = {
  rules: [],
  ruleFields: [],
};
