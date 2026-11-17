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

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { getStorageItem, updateStorageItem } from 'common/utils';
import { userIdSelector } from 'controllers/user';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';

type FlatViewSettingsFieldFn = (scopeId: string | number | null | undefined) => string;

const FLAT_VIEW_SETTINGS_FIELD_BY_INSTANCE: Record<TMS_INSTANCE_KEY, FlatViewSettingsFieldFn> = {
  [TMS_INSTANCE_KEY.TEST_CASE]: () => 'testCaseLibraryFolderTreeFlatView',
  [TMS_INSTANCE_KEY.TEST_PLAN]: (scopeId) => `testPlanFolderTreeFlatView_${String(scopeId)}`,
  [TMS_INSTANCE_KEY.MANUAL_LAUNCH]: (scopeId) =>
    `manualLaunchFolderTreeFlatView_${String(scopeId)}`,
};

export interface UseFlatViewPreferenceParams {
  instanceKey: TMS_INSTANCE_KEY;
  flatViewScopeId?: string | number | null;
}

const getSettingsFieldKey = (
  instanceKey: TMS_INSTANCE_KEY,
  scopeId: string | number | null | undefined,
) => {
  if (
    (scopeId === null || scopeId === undefined || scopeId === '') &&
    instanceKey !== TMS_INSTANCE_KEY.TEST_CASE
  ) {
    return null;
  }

  return FLAT_VIEW_SETTINGS_FIELD_BY_INSTANCE[instanceKey](scopeId);
};

const getFlatViewSettings = (userId: string, fieldKey: string) => {
  const settings = getStorageItem(`${userId}_settings`) as Record<string, unknown> | undefined;
  const value = settings?.[fieldKey];

  if (typeof value === 'boolean') {
    return value;
  }
};

const getFlatViewValue = (userId: string | undefined, fieldKey: string | null) => {
  if (!fieldKey) {
    return false;
  }

  if (userId) {
    const fromSettings = getFlatViewSettings(userId, fieldKey);

    if (typeof fromSettings === 'boolean') {
      return fromSettings;
    }
  }

  return false;
};

export const useFlatViewPreference = ({
  instanceKey,
  flatViewScopeId,
}: UseFlatViewPreferenceParams) => {
  const userId = useSelector(userIdSelector) as string | undefined;
  const fieldKey = getSettingsFieldKey(instanceKey, flatViewScopeId);
  const settingsStorageKey = userId ? `${userId}_settings` : null;
  const [isFlatView, setIsFlatView] = useState(() => getFlatViewValue(userId, fieldKey));
  const isMountedRef = useRef(false);

  useLayoutEffect(() => {
    setIsFlatView(getFlatViewValue(userId, fieldKey));
  }, [userId, fieldKey]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;

      return;
    }

    if (!settingsStorageKey || !fieldKey) {
      return;
    }

    updateStorageItem(settingsStorageKey, { [fieldKey]: isFlatView });
  }, [isFlatView, settingsStorageKey, fieldKey]);

  return {
    isFlatView,
    setIsFlatView,
  };
};
