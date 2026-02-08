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

import { useModal } from 'common/hooks';
import { ADD_TO_LAUNCH_MODAL_V2_KEY } from './constants';
import { AddToLaunchModalV2 } from './addToLaunchModalV2';

export const useAddToLaunchModalV2 = (selectedRowsIds: number[]) => {
  return useModal({
    modalKey: ADD_TO_LAUNCH_MODAL_V2_KEY,
    renderModal: () => <AddToLaunchModalV2 selectedRowsIds={selectedRowsIds} />,
  });
};
