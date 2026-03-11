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

import { useCallback, useState } from 'react';

import { ButtonSwitcherOption } from 'pages/inside/common/buttonSwitcher';

import { useReduxFormFieldBatchUpdate } from './useReduxFormFieldBatchUpdate';

interface UseFolderModalModeOptions {
  clearMoveToRootOnNewMode?: boolean;
  change: (field: string, value: unknown) => void;
}

export const useFolderModalMode = ({
  clearMoveToRootOnNewMode = true,
  change,
}: UseFolderModalModeOptions) => {
  const [currentMode, setCurrentMode] = useState(ButtonSwitcherOption.EXISTING);
  const batchUpdate = useReduxFormFieldBatchUpdate({ change });

  const handleModeChange = useCallback(
    (mode: ButtonSwitcherOption) => {
      setCurrentMode(mode);

      batchUpdate({
        mode,
        ...(mode === ButtonSwitcherOption.EXISTING
          ? {
              folderName: '',
              parentFolder: undefined,
              isRootFolder: false,
            }
          : {
              destinationFolder: undefined,
              ...(clearMoveToRootOnNewMode && { moveToRoot: false }),
            }),
      });
    },
    [batchUpdate, clearMoveToRootOnNewMode],
  );

  return {
    currentMode,
    handleModeChange,
  };
};
