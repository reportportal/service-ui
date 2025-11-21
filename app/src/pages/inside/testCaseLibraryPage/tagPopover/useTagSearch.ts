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

import { useState, useCallback, useEffect } from 'react';

import { fetch } from 'common/utils';
import { getErrorMessage } from 'common/utils/helperUtils/error.utils';
import { URLS } from 'common/urls';

import { Attribute } from '../types';

export enum TagError {
  TAG_ALREADY_ADDED = 'tagAlreadyAdded',
  CREATE_TAG_FAILED = 'createTagFailed',
}

interface AttributesResponse {
  content: Attribute[];
}

export const useTagSearch = (searchValue: string = '') => {
  const [tags, setTags] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<TagError | null>(null);

  const fetchTags = useCallback(async () => {
    if (!searchValue.trim()) {
      setTags([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch<AttributesResponse>(URLS.tmsAttributes(searchValue));

      setTags(response.content || []);
    } catch {
      setTags([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [searchValue]);

  const createTag = useCallback(
    async (tagKey: string): Promise<Attribute | null> => {
      try {
        setLoading(true);
        setError(null);

        const newTag = await fetch<Attribute>(URLS.createTmsAttribute(), {
          method: 'POST',
          data: { key: tagKey, value: tagKey },
        });

        await fetchTags();
        return newTag;
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);

        if (errorMessage.includes('already exists')) {
          setError(TagError.TAG_ALREADY_ADDED);
        } else {
          setError(TagError.CREATE_TAG_FAILED);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchTags],
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    createTag,
    refetch: fetchTags,
  };
};
