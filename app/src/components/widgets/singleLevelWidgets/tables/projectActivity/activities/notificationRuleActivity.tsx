/*
 * Copyright 2026 EPAM Systems
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

import type { ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  CREATE_NOTIFICATION_RULE,
  UPDATE_NOTIFICATION_RULE,
  DELETE_NOTIFICATION_RULE,
} from 'common/constants/actionTypes';
import { createClassnames } from 'common/utils/createClassnames';
import type { ProjectActivityHistoryItem, ProjectActivityItemBase } from './activityShape';
import { getActivityHistory } from './activityShape';
import styles from './common.scss';

const cx = createClassnames(styles);

type NotificationRuleActivityAction =
  | typeof CREATE_NOTIFICATION_RULE
  | typeof UPDATE_NOTIFICATION_RULE
  | typeof DELETE_NOTIFICATION_RULE;

interface NotificationRuleActivityItem extends ProjectActivityItemBase<
  NotificationRuleActivityAction,
  ProjectActivityHistoryItem
> {
  objectName: string;
}

const messages = defineMessages({
  createdRule: {
    id: 'ProjectActivityNotification.createdRuleNamed',
    defaultMessage: '<user>{actor}</user> created notification rule {name}.',
  },
  updatedRule: {
    id: 'ProjectActivityNotification.updatedRuleNamed',
    defaultMessage: '<user>{actor}</user> updated notification rule {name}. {ruleState}',
  },
  deletedRule: {
    id: 'ProjectActivityNotification.deletedRuleNamed',
    defaultMessage: '<user>{actor}</user> deleted notification rule {name}.',
  },
  ruleEnabled: {
    id: 'ProjectActivityNotification.ruleEnabled',
    defaultMessage: 'Rule is enabled.',
  },
  ruleDisabled: {
    id: 'ProjectActivityNotification.ruleDisabled',
    defaultMessage: 'Rule is disabled.',
  },
});

const ACTION_MESSAGES = {
  [CREATE_NOTIFICATION_RULE]: messages.createdRule,
  [UPDATE_NOTIFICATION_RULE]: messages.updatedRule,
  [DELETE_NOTIFICATION_RULE]: messages.deletedRule,
};

const RULE_STATE_MESSAGES = {
  true: messages.ruleEnabled,
  false: messages.ruleDisabled,
};

interface NotificationRuleActivityProps {
  activity: NotificationRuleActivityItem;
}

export const RuleNotificationActivity = ({ activity }: NotificationRuleActivityProps) => {
  const { formatMessage } = useIntl();
  const actionMessage = ACTION_MESSAGES[activity.actionType];
  const enabledChange = getActivityHistory(activity).find(({ field }) => field === 'enabled');
  const booleanStringValue = enabledChange.newValue === 'true' ? 'true' : 'false';
  const ruleState = enabledChange ? RULE_STATE_MESSAGES[booleanStringValue] : undefined;
  const renderUser = (chunks: ReactNode) => <span className={cx('user-name')}>{chunks}</span>;

  return formatMessage(actionMessage, {
    actor: activity.user,
    name: activity.objectName,
    user: renderUser,
    ruleState: ruleState && formatMessage(ruleState),
  });
};
