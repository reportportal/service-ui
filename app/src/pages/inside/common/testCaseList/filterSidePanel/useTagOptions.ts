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

import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';

export interface TagOption {
  value: string;
  label: string;
}

export const useTagOptions = () => {
  const projectKey = useSelector(projectKeySelector);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);

  const fetchTagOptions = useCallback(async () => {
    if (!projectKey) {
      setTagOptions([]);
      return;
    }

    try {
      const keys = await fetch<string[]>(URLS.tmsAttributeKeysSearch(projectKey, {}));
      setTagOptions(keys.map((key) => ({ value: key, label: key })));
    } catch {
      setTagOptions([]);
    }
  }, [projectKey]);

  return { tagOptions, fetchTagOptions };
};
