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
import { redirect } from 'redux-first-router';
import { useIntl, defineMessages } from 'react-intl';
import { BubblesLoader, Button, DeleteIcon } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { omit } from 'common/utils/omit';
import {
  urlOrganizationAndProjectSelector,
  querySelector,
  PROJECT_SETTINGS_TAB_PAGE,
} from 'controllers/pages';
import { projectKeySelector } from 'controllers/project';
import { activeOrganizationIdSelector } from 'controllers/organization';
import {
  removeIntegrationAction,
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
  namedOrganizationIntegrationsSelector,
} from 'controllers/plugins';
import { getTestIntegrationConnection } from 'controllers/plugins/utils';
import { showModalAction } from 'controllers/modal';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { createClassnames } from 'common/utils';
import { NamedIntegrations } from 'pages/inside/common/integrations/types';
import { messages as integrationsMessages } from 'pages/inside/common/integrations/messages';
import { DeleteIntegrationModal } from 'components/integrations/modals/deleteIntegrationModal';

import { IntegrationData } from '../types';
import { EmailDetailsCard } from '../emailDetailsCard';
import styles from './emailSettings.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  deleteIntegrationDescription: {
    id: 'ConnectionSection.deleteIntegrationDescription',
    defaultMessage: 'Are you sure you want to delete Integration {name}?',
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
  readonly isGlobal?: boolean;
  readonly isOrganizational?: boolean;
  readonly onRemoveConfirm?: () => void;
}

export function EmailSettings({
  data,
  goToPreviousPage,
  isGlobal = false,
  isOrganizational = false,
  onRemoveConfirm,
}: EmailSettingsProps) {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  const globalIntegrations: NamedIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const organizationIntegrations: NamedIntegrations = useSelector(
    namedOrganizationIntegrationsSelector,
  );
  const projectIntegrations: NamedIntegrations = useSelector(namedProjectIntegrationsSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as Record<string, string>;
  const projectKey = useSelector(projectKeySelector);
  const organizationId = useSelector(activeOrganizationIdSelector);
  const { canUpdateSettings, canUpdateOrganizationSettings } = useUserPermissions();
  const canManageIntegration = isOrganizational ? canUpdateOrganizationSettings : canUpdateSettings;
  const query = useSelector(querySelector) as Record<string, string>;

  const groupedIntegrations = useMemo(() => {
    const availableGlobal = globalIntegrations[query.subPage] || [];
    const availableOrganization = organizationIntegrations[query.subPage] || [];
    const availableProject = projectIntegrations[query.subPage] || [];
    return [...availableGlobal, ...availableOrganization, ...availableProject];
  }, [globalIntegrations, organizationIntegrations, projectIntegrations, query.subPage]);

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

  const testConnection = useMemo(
    () =>
      getTestIntegrationConnection({
        isGlobal,
        isOrganizational,
        context: { projectKey, organizationId },
      }),
    [projectKey, organizationId, isGlobal, isOrganizational],
  );

  const testIntegrationConnection = useCallback(() => {
    if ('id' in data) {
      setLoading(true);

      testConnection(data.id)
        .then(() => {
          setConnected(true);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setConnected(false);
        });
    }
  }, [data, testConnection]);

  useEffect(() => {
    if (!query.id) return;
    const queryId = Number(query.id);
    const isKnownIntegration =
      Number.isFinite(queryId) && groupedIntegrations.some(({ id }) => id === queryId);
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
    onRemoveConfirm?.();
    dispatch(removeIntegrationAction(data.id, isGlobal, goToPreviousPage, isOrganizational));
  };

  const handleDeleteClick = () => {
    const getDescription = () => {
      if (!isOrganizational) {
        return formatMessage(messages.deleteIntegrationDescription, { name: data.name });
      }

      const integrationsCount = (organizationIntegrations[query.subPage] || []).length;
      return integrationsCount > 1
        ? formatMessage(messages.deleteIntegrationDescription, { name: data.name })
        : formatMessage(integrationsMessages.deleteModalDescriptionOrganizationLast, {
            name: data.name,
            b: (chunks: React.ReactNode) => <b>{chunks}</b>,
          });
    };

    const modalData = {
      onConfirm: removeIntegration,
      modalTitle: formatMessage(messages.deleteIntegrationTitle),
      description: getDescription(),
    };

    dispatch(showModalAction({ component: <DeleteIntegrationModal data={modalData} /> }));
  };

  const blocked = data.blocked ?? false;
  const showDeleteSection = canManageIntegration && !blocked;

  return (
    <div className={cx('email-settings')}>
      {loading ? (
        <BubblesLoader className={cx('center')} />
      ) : (
        <>
          <div>
            <EmailDetailsCard data={data} connected={connected} isEditable={canManageIntegration} />
          </div>

          {showDeleteSection && (
            <div className={cx('delete-section')}>
              <h3 className={cx('delete-title')}>
                {formatMessage(messages.deleteIntegrationTitle)}
              </h3>
              <Button
                variant="ghost-danger"
                icon={<DeleteIcon />}
                onClick={handleDeleteClick}
                data-automation-id="deleteIntegrationButton"
              >
                {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
