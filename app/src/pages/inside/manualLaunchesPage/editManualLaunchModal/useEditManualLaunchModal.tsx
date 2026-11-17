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
import { noop } from 'es-toolkit';

import { useModal } from 'common/hooks';

import { EditManualLaunchModal } from './editManualLaunchModal';
import { ManualLaunchData, UseEditManualLaunchModalOptions } from './types';
import { EDIT_MANUAL_LAUNCH_MODAL_KEY } from './constants';

export const useEditManualLaunchModal = ({
  onSuccess = noop,
}: UseEditManualLaunchModalOptions = {}) => {
  const { openModal: openRawModal } = useModal<ManualLaunchData>({
    modalKey: EDIT_MANUAL_LAUNCH_MODAL_KEY,
    renderModal: (data) => (
      <EditManualLaunchModal
        data={data || { id: 0, name: '', attributes: [] }}
        onSuccess={onSuccess}
      />
    ),
  });

  const openModal = useCallback(
    (launchData: ManualLaunchData) => {
      openRawModal(launchData);
    },
    [openRawModal],
  );

  return { openModal };
};
