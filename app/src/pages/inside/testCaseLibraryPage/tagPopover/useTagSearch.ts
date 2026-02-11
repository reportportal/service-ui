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
  const [allTags, setAllTags] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<TagError | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch<AttributesResponse>(URLS.tmsAttributes({}));

      setAllTags(response.content || []);
    } catch {
      setAllTags([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(
    (tagKey: string, selectedTags: Attribute[] = []) => {
      const tagExists = allTags.some((tag) => tag.key.toLowerCase() === tagKey.toLowerCase());
      const tagAlreadySelected = selectedTags.some(
        (tag) => tag.key.toLowerCase() === tagKey.toLowerCase(),
      );

      if (tagExists || tagAlreadySelected) {
        setError(TagError.TAG_ALREADY_ADDED);
        return null;
      }

      setError(null);

      const newTag: Attribute = {
        id: -Date.now(),
        key: tagKey,
        value: tagKey,
      };

      setAllTags((prevTags) => [...prevTags, newTag]);

      return newTag;
    },
    [allTags],
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchTags();
  }, [fetchTags]);

  const filteredTags = searchValue.trim()
    ? allTags.filter((tag) => tag.key.toLowerCase().includes(searchValue.toLowerCase()))
    : allTags;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    allTags,
    tags: filteredTags,
    loading,
    error,
    createTag,
    clearError,
    refetch: fetchTags,
  };
};
