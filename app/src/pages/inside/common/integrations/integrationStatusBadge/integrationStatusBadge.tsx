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

import { ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { OkIcon, WarningIcon } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { ConditionalTooltip } from 'components/main/conditionalTooltip';
import styles from './integrationStatusBadge.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  integrationStatusActive: {
    id: 'IntegrationsDescription.integrationStatusActive',
    defaultMessage: 'Active',
  },
  integrationStatusInactive: {
    id: 'IntegrationsDescription.integrationStatusInactive',
    defaultMessage: 'Inactive',
  },
  integrationStatusError: {
    id: 'IntegrationsDescription.integrationStatusError',
    defaultMessage: 'Connection error',
  },
  integrationStatusConnected: {
    id: 'IntegrationsDescription.integrationStatusConnected',
    defaultMessage: 'Connected',
  },
  integrationStatusNotConfigured: {
    id: 'IntegrationsDescription.integrationStatusNotConfigured',
    defaultMessage: 'Not configured',
  },
});

export const IntegrationStatus = {
  ERROR: 'error',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CONNECTED: 'connected',
  NOT_CONFIGURED: 'not-configured',
} as const;

type IntegrationStatusType = (typeof IntegrationStatus)[keyof typeof IntegrationStatus];

interface IntegrationStatusBadgeProps {
  variant: IntegrationStatusType;
  tooltip?: ReactNode;
}

export const IntegrationStatusBadge = ({ variant, tooltip }: IntegrationStatusBadgeProps) => {
  const { formatMessage } = useIntl();

  if (!variant) {
    return null;
  }

  let label: string;
  let icon: ReactNode = null;

  switch (variant) {
    case IntegrationStatus.ACTIVE:
      label = formatMessage(messages.integrationStatusActive);
      break;
    case IntegrationStatus.ERROR:
      label = formatMessage(messages.integrationStatusError);
      icon = <WarningIcon />;
      break;
    case IntegrationStatus.INACTIVE:
      label = formatMessage(messages.integrationStatusInactive);
      break;
    case IntegrationStatus.CONNECTED:
      label = formatMessage(messages.integrationStatusConnected);
      icon = <OkIcon />;
      break;
    case IntegrationStatus.NOT_CONFIGURED:
      label = formatMessage(messages.integrationStatusNotConfigured);
      icon = <WarningIcon />;
      break;
    default:
      label = formatMessage(messages.integrationStatusActive);
      break;
  }

  return (
    <ConditionalTooltip
      content={tooltip}
      placement="top"
      wrapperClassName={cx('tooltip-wrapper')}
      tooltipClassName={cx('tooltip')}
    >
      <span className={cx('badge', variant)} data-automation-id="integrationStatusBadge">
        {icon && <span className={cx('icon')}>{icon}</span>}
        <span className={cx('label')}>{label}</span>
      </span>
    </ConditionalTooltip>
  );
};
