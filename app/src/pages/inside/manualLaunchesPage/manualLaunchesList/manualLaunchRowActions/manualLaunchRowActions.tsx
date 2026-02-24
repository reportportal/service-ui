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

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { MetaData } from '@reportportal/ui-kit/components/table/types';

import { ActionMenu } from 'components/actionMenu';
import { useEditManualLaunchModal } from 'pages/inside/manualLaunchesPage/editManualLaunchModal';
import { ManualLaunchItem } from 'pages/inside/manualLaunchesPage/types';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';

import { useManualLaunchesListRowActions } from '../hooks/useManualLaunchesListRowActions';

interface SingleDeleteData {
  id: number;
  name: string;
}

interface ManualLaunchRowActionsProps {
  metaData: MetaData;
  onDelete: (data: SingleDeleteData) => void;
  onRefresh?: () => void;
}

export const ManualLaunchRowActions = ({
  metaData,
  onDelete,
  onRefresh,
}: ManualLaunchRowActionsProps) => {
  const projectKey = useSelector(projectKeySelector);
  const { openModal: openEditModal } = useEditManualLaunchModal({
    onSuccess: onRefresh,
  });

  const handleEdit = useCallback(() => {
    const launchId = metaData.id as number;

    const fetchAndOpenModal = async () => {
      try {
        const launchData = await fetch<ManualLaunchItem>(
          URLS.manualLaunchById(projectKey, launchId),
        );

        const modalData = {
          id: launchData.id,
          name: launchData.name,
          description: launchData.description,
          testPlan: launchData.testPlan
            ? { id: launchData.testPlan.id, name: launchData.testPlan.name }
            : null,
          attributes: launchData.attributes || [],
        };

        openEditModal(modalData);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchAndOpenModal();
  }, [openEditModal, metaData.id, projectKey]);

  const handleDelete = useCallback(() => {
    onDelete({ id: metaData.id as number, name: metaData.name as string });
  }, [onDelete, metaData.id, metaData.name]);

  const rowActions = useManualLaunchesListRowActions({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return <ActionMenu actions={rowActions} />;
};
