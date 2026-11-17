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

import { useEffect, useState, useMemo, useCallback, useContext, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { redirect } from 'redux-first-router';
import { useIntl, defineMessages } from 'react-intl';
import { BubblesLoader, Button, DeleteIcon } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { omit } from 'common/utils/omit';
import {
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
  querySelector,
  PROJECT_SETTINGS_TAB_PAGE,
  ORGANIZATION_SETTINGS_TAB_PAGE,
  pageLevelSelector,
  APP_LEVEL,
} from 'controllers/pages';
import { projectInfoIdSelector, projectKeySelector } from 'controllers/project';
import { activeOrganizationIdSelector } from 'controllers/organization';
import {
  removeIntegrationAction,
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
  namedOrganizationIntegrationsSelector,
} from 'controllers/plugins';
import { getTestIntegrationConnection } from 'controllers/plugins/utils';
import { showModalAction, hideModalAction } from 'controllers/modal';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { createClassnames } from 'common/utils';
import { NamedIntegrations } from 'pages/inside/common/integrations/types';
import { messages as integrationsMessages } from 'pages/inside/common/integrations/messages';
import { DeleteIntegrationModal } from 'components/integrations/modals/deleteIntegrationModal';
import AddIntegrationModal from 'components/integrations/modals/addIntegrationModal/addIntegrationModal';
import { IntegrationAnalyticsContext } from 'components/integrations/integrationAnalyticsContext';

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
  editOrganizationIntegrationTitle: {
    id: 'EmailSettings.editOrganizationIntegrationTitle',
    defaultMessage: 'Edit Organizational Integration',
  },
});

interface EmailSettingsProps {
  readonly data: IntegrationData;
  readonly goToPreviousPage: () => void;
  readonly onUpdate?: (
    formData: Record<string, unknown>,
    onSuccess: () => void,
    metaData: Record<string, unknown>,
  ) => void;
  readonly isGlobal?: boolean;
  readonly isOrganizational?: boolean;
  readonly onRemoveConfirm?: () => void;
}

const Bold = (chunks: ReactNode) => <b>{chunks}</b>;

export function EmailSettings({
  data,
  goToPreviousPage,
  isGlobal = false,
  isOrganizational = false,
  onUpdate,
  onRemoveConfirm,
}: EmailSettingsProps) {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const analyticsContext = useContext(IntegrationAnalyticsContext);
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  const globalIntegrations: NamedIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const organizationIntegrations: NamedIntegrations = useSelector(
    namedOrganizationIntegrationsSelector,
  );
  const projectIntegrations: NamedIntegrations = useSelector(namedProjectIntegrationsSelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const projectId = useSelector(projectInfoIdSelector);
  const projectKey = useSelector(projectKeySelector);
  const organizationId = useSelector(activeOrganizationIdSelector);
  const { canUpdateSettings, canUpdateOrganizationSettings } = useUserPermissions();
  const canManageIntegration = isOrganizational ? canUpdateOrganizationSettings : canUpdateSettings;
  const query = useSelector(querySelector) as Record<string, string>;
  const pageLevel = useSelector(pageLevelSelector);

  const groupedIntegrations = useMemo(() => {
    const availableGlobal = globalIntegrations[query.subPage] || [];
    const availableOrganization = organizationIntegrations[query.subPage] || [];
    const availableProject = projectIntegrations[query.subPage] || [];
    return [...availableGlobal, ...availableOrganization, ...availableProject];
  }, [globalIntegrations, organizationIntegrations, projectIntegrations, query.subPage]);

  const namedSubPage = useMemo(
    () => ({
      type:
        pageLevel === APP_LEVEL.ORGANIZATION
          ? ORGANIZATION_SETTINGS_TAB_PAGE
          : PROJECT_SETTINGS_TAB_PAGE,
      payload:
        pageLevel === APP_LEVEL.ORGANIZATION
          ? { organizationSlug, settingsTab: INTEGRATIONS }
          : { organizationSlug, projectSlug, settingsTab: INTEGRATIONS },
      query: {
        ...omit(query, ['id']),
      },
    }),
    [organizationSlug, projectSlug, query, pageLevel],
  );

  const pluginName = data.integrationType?.name ?? query.subPage;

  const testConnection = useMemo(
    () =>
      getTestIntegrationConnection({
        pluginName,
        isGlobal,
        isOrganizational,
        context: { projectId, projectKey, organizationId },
      }),
    [pluginName, projectId, projectKey, organizationId, isGlobal, isOrganizational],
  );

  const integrationId = data.id;

  const testIntegrationConnection = useCallback(() => {
    if (integrationId) {
      setLoading(true);

      testConnection(integrationId)
        .then(() => {
          setConnected(true);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setConnected(false);
        });
    }
  }, [integrationId, testConnection]);

  useEffect(() => {
    if (!query.id) return;
    const queryId = Number(query.id);
    const isKnownIntegration =
      Number.isFinite(queryId) && groupedIntegrations.some(({ id }) => id === queryId);
    if (!isKnownIntegration) {
      dispatch(redirect(namedSubPage));
    }
  }, [query, groupedIntegrations, dispatch, namedSubPage]);

  useEffect(() => {
    if (query.id || integrationId) {
      testIntegrationConnection();
    }
  }, [query.id, integrationId, testIntegrationConnection]);

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
            b: Bold,
          });
    };

    const modalData = {
      onConfirm: removeIntegration,
      onConfirmTrackEvent: analyticsContext?.deleteConfirmEvent
        ? () => analyticsContext.deleteConfirmEvent(data.integrationType?.name)
        : undefined,
      modalTitle: formatMessage(messages.deleteIntegrationTitle),
      description: getDescription(),
    };

    dispatch(showModalAction({ component: <DeleteIntegrationModal data={modalData} /> }));
  };

  const handleEditClick = () => {
    if (!onUpdate) {
      return;
    }

    const getConfirmationFunc = (
      data: Record<string, unknown>,
      metaData: Record<string, unknown>,
    ) => {
      onUpdate(
        data,
        () => {
          dispatch(hideModalAction());
          testIntegrationConnection();
        },
        metaData,
      );
    };

    const modalData = {
      isGlobal,
      instanceType: data.integrationType.name,
      onConfirm: getConfirmationFunc,
      customProps: {
        initialData: {
          ...data.integrationParameters,
          integrationName: data.name,
        },
        editAuthMode: true,
        okButtonLabel: formatMessage(COMMON_LOCALE_KEYS.SAVE_CHANGES),
        ...(isOrganizational && {
          modalTitleMessage: formatMessage(messages.editOrganizationIntegrationTitle),
        }),
      },
    };

    dispatch(showModalAction({ component: <AddIntegrationModal data={modalData} /> }));
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
            <EmailDetailsCard
              data={data}
              connected={connected}
              isEditable={canManageIntegration}
              onEditClick={handleEditClick}
            />
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
