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

import { ReactNode, useCallback } from 'react';
import { Button, DeleteIcon, PlusIcon } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { ConditionalTooltip } from 'components/main/conditionalTooltip';
import { IntegrationCollection } from '../integrationCollection';
import { IntegrationItem } from '../types';
import styles from './availableIntegrations.scss';
import { useIntl } from 'react-intl';
import { messages } from '../messages';

const cx = createClassnames(styles);

export interface AvailableIntegrationsProps {
  header?: string;
  text?: string;
  integrations?: IntegrationItem[];
  inactive?: boolean;
  inactiveTooltip?: ReactNode;
  withEmptyState?: boolean;
  emptyStateText?: string;
  hasUpdatePermission?: boolean;
  createButtonText?: string;
  createButtonDisabled?: boolean;
  createButtonTooltip?: ReactNode;
  resetButtonText?: string;
  onCreateClick?: () => void;
  onResetClick?: () => void;
  openIntegration?: (item: IntegrationItem) => void;
  testConnection?: (id: number) => Promise<unknown>;
}

export const AvailableIntegrations = ({
  header = '',
  text = '',
  integrations = [],
  inactive = false,
  inactiveTooltip,
  withEmptyState = false,
  emptyStateText: emptyStateTextProp,
  hasUpdatePermission = false,
  createButtonText,
  createButtonDisabled = false,
  createButtonTooltip,
  resetButtonText,
  onCreateClick,
  onResetClick,
  openIntegration,
  testConnection,
}: AvailableIntegrationsProps) => {
  const { formatMessage } = useIntl();

  const hasItems = integrations.length > 0;
  const showEmptyState = !hasItems && withEmptyState;
  const showSection = hasItems || showEmptyState;
  const emptyStateText = emptyStateTextProp ?? formatMessage(messages.emptyStateText);

  const renderCreateButton = useCallback(
    (emptyState = true) => {
      if (!hasUpdatePermission || !onCreateClick) return null;

      return (
        <ConditionalTooltip
          content={createButtonTooltip}
          placement="top"
          wrapperClassName={cx('tooltip-wrapper')}
          tooltipClassName={cx('tooltip')}
        >
          <Button
            variant={emptyState ? 'primary' : 'text'}
            icon={<PlusIcon />}
            onClick={onCreateClick}
            disabled={createButtonDisabled}
          >
            {createButtonText ?? formatMessage(messages.createIntegration)}
          </Button>
        </ConditionalTooltip>
      );
    },
    [
      hasUpdatePermission,
      createButtonText,
      createButtonDisabled,
      createButtonTooltip,
      onCreateClick,
      formatMessage,
    ],
  );

  const renderResetButton = useCallback(() => {
    if (!hasUpdatePermission || !onResetClick) return null;

    return (
      <Button variant="text-danger" icon={<DeleteIcon />} onClick={onResetClick}>
        {resetButtonText ?? formatMessage(messages.resetIntegrations)}
      </Button>
    );
  }, [hasUpdatePermission, onResetClick, resetButtonText, formatMessage]);

  if (!showSection) {
    return null;
  }

  return (
    <div className={cx('available-integrations')}>
      <div>
        <h1 className={cx('integrations-header')}>{header}</h1>
        <p className={cx('integrations-text')}>{text}</p>
      </div>
      {showEmptyState && (
        <div className={cx('empty-state')}>
          {emptyStateText && <span className={cx('empty-state-text')}>{emptyStateText}</span>}
          {renderCreateButton()}
        </div>
      )}
      {hasItems && (
        <>
          <IntegrationCollection
            items={integrations}
            inactive={inactive}
            inactiveTooltip={inactiveTooltip}
            openIntegration={openIntegration}
            testConnection={testConnection}
          />

          {hasUpdatePermission && (
            <div className={cx('actions')}>
              {renderCreateButton(false)}
              {renderResetButton()}
            </div>
          )}
        </>
      )}
    </div>
  );
};
