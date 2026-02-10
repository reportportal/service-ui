/*
 * Copyright 2025 EPAM Systems
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
import { noop } from 'es-toolkit';
import { VoidFn } from '@reportportal/ui-kit/common/types/commonTypes';

import { useModal } from 'common/hooks';

import {
  DELETE_MANUAL_LAUNCH_MODAL_KEY,
  DeleteManualLaunchModal,
  DeleteManualLaunchModalData,
} from './deleteManualLaunchModal';

interface UseDeleteManualLaunchModalOptions {
  onSuccess?: VoidFn;
}

export const useDeleteManualLaunchModal = ({
  onSuccess = noop,
}: UseDeleteManualLaunchModalOptions = {}) => {
  const { openModal: openRawModal, ...rest } = useModal<DeleteManualLaunchModalData>({
    modalKey: DELETE_MANUAL_LAUNCH_MODAL_KEY,
    renderModal: (data) => <DeleteManualLaunchModal data={data} onSuccess={onSuccess} />,
  });

  const openModal = useCallback(
    (data: Omit<Extract<DeleteManualLaunchModalData, { type: 'single' }>, 'type'>) => {
      openRawModal({ ...data, type: 'single' });
    },
    [openRawModal],
  );

  return { openModal, ...rest };
};

interface BatchDeleteData {
  launchIds: number[];
  onClearSelection?: VoidFn;
}

export const useBatchDeleteManualLaunchesModal = () => {
  const { openModal: openRawModal, ...rest } = useModal<DeleteManualLaunchModalData>({
    modalKey: DELETE_MANUAL_LAUNCH_MODAL_KEY,
    renderModal: (data) => <DeleteManualLaunchModal data={data} />,
  });

  const openModal = useCallback(
    (data: BatchDeleteData) => {
      openRawModal({ ...data, type: 'batch' });
    },
    [openRawModal],
  );

  return { openModal, ...rest };
};
