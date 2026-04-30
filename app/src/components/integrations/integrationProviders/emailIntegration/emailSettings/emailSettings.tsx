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

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import { BubblesLoader } from '@reportportal/ui-kit';
import Parser from 'html-react-parser';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { omit } from 'common/utils/omit';
import {
  urlOrganizationAndProjectSelector,
  querySelector,
  PROJECT_SETTINGS_TAB_PAGE,
} from 'controllers/pages';
import { projectKeySelector } from 'controllers/project';
import {
  removeIntegrationAction,
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
} from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { redirect } from 'redux-first-router';
import TrashBin from 'common/img/newIcons/bin-inline.svg';
import { IntegrationData } from '../types';
import { EmailDetailsCard } from '../emailDetailsCard';
import styles from './emailSettings.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  deleteIntegrationDescription: {
    id: 'ConnectionSection.deleteIntegrationDescription',
    defaultMessage: 'Are you sure you want to delete Integration',
  },
  deleteIntegrationTitle: {
    id: 'EmailSettings.deleteIntegrationTitle',
    defaultMessage: 'Delete integration',
  },
});

interface EmailSettingsProps {
  readonly data: IntegrationData;
  readonly goToPreviousPage: () => void;
  // TODO: wire up onUpdate when edit form is implemented
  // eslint-disable-next-line react/no-unused-prop-types
  readonly onUpdate?: (
    formData: Record<string, unknown>,
    onSuccess: () => void,
    metaData: Record<string, unknown>,
  ) => void;
  readonly isGlobal: boolean;
}

export function EmailSettings({
  data,
  goToPreviousPage,
  isGlobal = false,
}: EmailSettingsProps) {
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  const globalIntegrations = useSelector(namedGlobalIntegrationsSelector) as Record<string, IntegrationData[]>;
  const projectIntegrations = useSelector(namedProjectIntegrationsSelector) as Record<string, IntegrationData[]>;
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector) as Record<string, string>;
  const projectKey = useSelector(projectKeySelector);
  const { canUpdateSettings } = useUserPermissions();
  const query = useSelector(querySelector) as Record<string, string>;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const groupedIntegrations = useMemo(() => {
    const availableGlobal = globalIntegrations[query.subPage] || [];
    const availableProject = projectIntegrations[query.subPage] || [];
    return [...availableGlobal, ...availableProject];
  }, [globalIntegrations, projectIntegrations, query.subPage]);

  const namedSubPage = useMemo(
    () => ({
      type: PROJECT_SETTINGS_TAB_PAGE,
      payload: { organizationSlug, projectSlug, settingsTab: INTEGRATIONS },
      meta: {
        query: omit(query, ['id']),
      },
    }),
    [organizationSlug, projectSlug, query],
  );

  const testIntegrationConnection = useCallback(() => {
    if ('id' in data) {
      setLoading(true);
      const fetchConnection = isGlobal
        ? fetch(URLS.testGlobalIntegrationConnection(data.id))
        : fetch(URLS.testIntegrationConnection(projectKey, data.id));

      fetchConnection
        .then(() => {
          setConnected(true);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setConnected(false);
        });
    }
  }, [data, projectKey, isGlobal]);

  useEffect(() => {
    if (!query.id) return;
    const queryId = Number(query.id);
    const isKnownIntegration = Number.isFinite(queryId) && groupedIntegrations.some(({ id }) => id === queryId);
    if (!isKnownIntegration) {
      // @ts-expect-error redirect typing mismatch with redux-first-router
      dispatch(redirect(namedSubPage));
    }
  }, [query, groupedIntegrations, dispatch, namedSubPage]);

  useEffect(() => {
    if (query.id || data.id) {
      testIntegrationConnection();
    }
  }, [query.id, data.id, testIntegrationConnection]);

  const removeIntegration = () => {
    dispatch(removeIntegrationAction(data.id, isGlobal, goToPreviousPage));
  };

  const handleDeleteClick = () => {
    dispatch(
      showModalAction({
        id: 'deleteIntegrationModal',
        data: {
          onConfirm: removeIntegration,
          modalTitle: `${formatMessage(COMMON_LOCALE_KEYS.DELETE)} ${data.name}`,
          description: `${formatMessage(messages.deleteIntegrationDescription)} ${data.name}?`,
        },
      }),
    );
  };

  const blocked = data.blocked ?? false;
  const showDeleteSection = canUpdateSettings && !blocked;

  return (
    <div className={cx('email-settings')}>
      {loading ? (
        <BubblesLoader className={cx('center')} />
      ) : (
        <>
          <div>
            <EmailDetailsCard
              data={data}
              connected={connected}
              isEditable={canUpdateSettings}
            />
          </div>

          {showDeleteSection && (
            <div className={cx('delete-section')}>
              <h3 className={cx('delete-title')}>
                {formatMessage(messages.deleteIntegrationTitle)}
              </h3>
              <button
                type="button"
                className={cx('delete-button')}
                onClick={handleDeleteClick}
                data-automation-id="deleteIntegrationButton"
              >
                <span className={cx('delete-button-icon')}>{Parser(TrashBin)}</span>
                <span>{formatMessage(COMMON_LOCALE_KEYS.DELETE)}</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
