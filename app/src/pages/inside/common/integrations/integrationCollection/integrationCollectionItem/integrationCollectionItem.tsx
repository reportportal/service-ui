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

import { useState, useEffect, useMemo, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { ArrowRightIcon, BubblesLoader } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { IntegrationStatusBadge, IntegrationStatus } from '../../integrationStatusBadge';
import { IntegrationItem } from '../../types';
import { messages } from '../../messages';
import styles from './integrationCollectionItem.scss';

const cx = createClassnames(styles);

export interface IntegrationCollectionItemProps {
  id?: number;
  title?: string;
  creationInfo?: string;
  creator?: string;
  inactive?: boolean;
  inactiveTooltip?: ReactNode;
  item: IntegrationItem;
  openIntegration?: (item: IntegrationItem) => void;
  testConnection?: (id: number) => Promise<unknown>;
}

export const IntegrationCollectionItem = ({
  id,
  title = '',
  creationInfo = '',
  creator = '',
  inactive = false,
  inactiveTooltip,
  item,
  openIntegration = () => {},
  testConnection,
}: IntegrationCollectionItemProps) => {
  const { formatMessage } = useIntl();
  const [connected, setConnected] = useState(true);
  const [isConnectionLoading, setIsConnectionLoading] = useState(() =>
    Boolean(testConnection && id != null && !inactive),
  );

  useEffect(() => {
    if (!testConnection || id == null || inactive) {
      setIsConnectionLoading(false);
      return undefined;
    }

    let cancelled = false;
    const checkConnection = () => {
      setIsConnectionLoading(true);

      testConnection(id)
        .then(() => {
          if (!cancelled) {
            setConnected(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setConnected(false);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsConnectionLoading(false);
          }
        });
    };

    checkConnection();

    return () => {
      cancelled = true;
    };
  }, [testConnection, id, inactive]);

  const statusVariant = useMemo(() => {
    if (!connected) return IntegrationStatus.ERROR;

    return inactive ? IntegrationStatus.INACTIVE : IntegrationStatus.ACTIVE;
  }, [connected, inactive]);

  const tooltip = useMemo(() => {
    return statusVariant === IntegrationStatus.INACTIVE ? inactiveTooltip : undefined;
  }, [statusVariant, inactiveTooltip]);

  const itemClickHandler = () => {
    openIntegration(item);
  };

  return (
    <li>
      <button
        onClick={itemClickHandler}
        className={cx('instances-list-item')}
        data-automation-id="listItem"
      >
        <div className={cx('item-data')}>
          <div className={cx('general-info')}>
            <h4 className={cx('integration-name')} title={title}>
              {title}
            </h4>
            {isConnectionLoading ? (
              <BubblesLoader />
            ) : (
              <IntegrationStatusBadge variant={statusVariant} tooltip={tooltip} />
            )}
          </div>
          <span className={cx('creation-info')}>
            {creator
              ? formatMessage(messages.integrationCreatedByOn, { creator, creationInfo })
              : creationInfo}
          </span>
        </div>

        <div className={cx('arrow-control')} data-automation-id="openIntegrationIcon">
          <ArrowRightIcon />
        </div>
      </button>
    </li>
  );
};
