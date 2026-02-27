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
import { useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';

import { Tag, TagError } from '../types';
import { convertKeysToTags } from '../testCaseDetailsPage/utils';

export const useTagSearch = (searchValue: string = '') => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<TagError | null>(null);
  const projectKey = useSelector(projectKeySelector);

  const fetchAllTags = useCallback(async () => {
    try {
      const keys = await fetch<string[]>(URLS.tmsAttributeKeysSearch(projectKey, {}));
      setAllTags(convertKeysToTags(keys));
    } catch {
      setAllTags([]);
    }
  }, [projectKey]);

  const fetchFilteredTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const keys = await fetch<string[]>(
        URLS.tmsAttributeKeysSearch(projectKey, {
          search: searchValue.trim(),
        }),
      );

      setTags(convertKeysToTags(keys));
    } catch {
      setTags([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [projectKey, searchValue]);

  const createTag = useCallback(
    (tagKey: string, selectedTags: Tag[] = []) => {
      const tagExists = allTags.some((tag) => tag.key.toLowerCase() === tagKey.toLowerCase());
      const tagAlreadySelected = selectedTags.some(
        (tag) => tag.key.toLowerCase() === tagKey.toLowerCase(),
      );

      if (tagExists || tagAlreadySelected) {
        setError(TagError.TAG_ALREADY_ADDED);
        return null;
      }

      setError(null);

      const newTag: Tag = {
        id: -Date.now(),
        key: tagKey,
      };

      setAllTags((prevTags) => [...prevTags, newTag]);
      setTags((prevTags) => [...prevTags, newTag]);

      return newTag;
    },
    [allTags],
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchAllTags();
  }, [fetchAllTags]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchFilteredTags();
  }, [fetchFilteredTags]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    allTags,
    tags,
    loading,
    error,
    createTag,
    clearError,
    refetch: fetchFilteredTags,
  };
};
