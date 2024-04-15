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
import { Toggle } from 'componentLibrary/toggle';
import { Button } from 'componentLibrary/button';
import plusIcon from 'common/img/plus-button-inline.svg';
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
  projectNotificationsStateSelector,
  updateProjectNotificationAction,
} from 'controllers/project';
import { canUpdateSettings } from 'common/utils/permissions';
import { updateNotificationStateAction } from 'controllers/project/actionCreators';
import { useDispatch, useSelector } from 'react-redux';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { DEFAULT_CASE_CONFIG } from '../constants';
import { convertNotificationCaseForSubmission } from '../utils';
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
export const RuleGroup = ({ pluginName, typedRules, notifications }) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();

  const dispatch = useDispatch();
  const enabled = useSelector(projectNotificationsStateSelector);
  const projectRole = useSelector(activeProjectRoleSelector);
  const userRole = useSelector(userAccountRoleSelector);
  const isEmailIntegrationAvailable = useSelector(isEmailIntegrationAvailableSelector);

  const isAbleToEdit = () =>
    canUpdateSettings(userRole, projectRole) && isEmailIntegrationAvailable;

  const toggleNotificationsEnabled = (isEnabled) => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_CHECKBOX_AUTO_NOTIFICATIONS(isEnabled));
    dispatch(updateNotificationStateAction(isEnabled));
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

  const handleRuleItemClick = (isShown) => {
    if (isShown) {
      trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_TO_EXPAND_NOTIFICATIONS_DETAILS);
    }
  };

  const confirmAdd = (newNotification) => {
    console.log(newNotification);
    const notification = convertNotificationCaseForSubmission(newNotification);
    dispatch(addProjectNotificationAction(notification));
  };

  const confirmDelete = (id) => {
    dispatch(deleteProjectNotificationAction(id));
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

  const onAdd = () => {
    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_CREATE_RULE_BUTTON);

    dispatch(
      showModalAction({
        id: 'addEditNotificationModal',
        data: {
          type: pluginName,
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
    <div className={cx('rule-section')}>
      <Layout description={''}>
        <div className={cx('rule-section-header')}>
          <FieldElement
            className={cx('fieldElement')}
            withoutProvider
            description={formatMessage(messages.typeDescription, { type: pluginName })}
          >
            <div className={cx('toggle')}>
              <Toggle
                disabled={isReadOnly}
                value // poxel
                onChange={(e) => toggleNotificationsEnabled(e.target.checked)}
                dataAutomationId="enabledToggle"
              >
                <span className={cx('name-wrapper')}>
                  <i className={cx('capitalized')}> {pluginName}</i>
                </span>
              </Toggle>
            </div>
          </FieldElement>
          {!enabled ? (
            <div className={cx('disabled-plugin')}>
              <p>
                <span className={cx('capitalized')}>{pluginName} </span>
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
            ''
          )}
        </div>

        {enabled && (
          <div className={cx('notifications-container')}>
            {typedRules?.length > 0 ? (
              <div className={cx('contentItems')}>
                <RuleList
                  disabled={isReadOnly}
                  data={typedRules.map((rule) => ({
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
              </div>
            ) : (
              <EmptyRuleState ruleName={pluginName} onCreateClick={onAdd} />
            )}
          </div>
        )}
      </Layout>
    </div>
  );
};
const ruleShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  ruleName: PropTypes.string.isRequired,
  recipients: PropTypes.array.isRequired,
  sendCase: PropTypes.string.isRequired,
  launchNames: PropTypes.array.isRequired,
  attributes: PropTypes.array.isRequired,
  enabled: PropTypes.bool.isRequired,
  attributesOperator: PropTypes.string.isRequired,
  informOwner: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
});

RuleGroup.propTypes = {
  pluginName: PropTypes.string.isRequired,
  typedRules: PropTypes.arrayOf(ruleShape).isRequired,
  notifications: PropTypes.arrayOf(ruleShape).isRequired,
};
