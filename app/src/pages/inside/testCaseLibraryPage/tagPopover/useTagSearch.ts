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
import { isNotNil } from 'es-toolkit';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { Tag } from 'types/testCase';

import { TagError, AttributesResponse } from '../types';

const normalizeTagKey = (value: string) => value.trim().toLowerCase();

const dedupeTagsByKey = (tags: Tag[]): Tag[] => {
  const seen = new Set<string>();
  const result: Tag[] = [];

  tags.forEach((tag) => {
    const normalizedKey = normalizeTagKey(tag.key);

    if (!normalizedKey || seen.has(normalizedKey)) {
      return;
    }

    seen.add(normalizedKey);
    result.push({ ...tag, key: normalizedKey });
  });

  return result;
};

export const useTagSearch = (searchValue: string = '') => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<TagError | null>(null);
  const projectKey = useSelector(projectKeySelector);

  const fetchAllTags = useCallback(async () => {
    if (!projectKey) {
      setAllTags([]);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch<AttributesResponse>(URLS.tmsAttributes(projectKey, {}));
      const tagsOnly = (response.content || []).filter((attr) => !attr.value);

      setAllTags(dedupeTagsByKey(tagsOnly));
    } catch {
      setAllTags([]);
    } finally {
      setLoading(false);
    }
  }, [projectKey]);

  const fetchFilteredTags = useCallback(async () => {
    if (!projectKey) {
      setTags([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const keys = await fetch<string[]>(
        URLS.tmsAttributeKeysSearch(projectKey, {
          search: searchValue.trim(),
        }),
      );

      const matchedTags = keys
        .map((key) => {
          const normalizedKey = normalizeTagKey(key);

          return allTags.find((tag) => normalizeTagKey(tag.key) === normalizedKey);
        })
        .filter(isNotNil);

      setTags(dedupeTagsByKey(matchedTags));
    } catch {
      setTags([]);
      setError(TagError.TAG_SEARCH_FAILED);
    } finally {
      setLoading(false);
    }
  }, [projectKey, searchValue, allTags]);

  const createTag = useCallback(
    (tagKey: string, selectedTags: Tag[] = []) => {
      const normalizedTagKey = normalizeTagKey(tagKey);
      const existingTag = allTags.find(
        (tag) => normalizeTagKey(tag.key) === normalizedTagKey,
      );
      const tagAlreadySelected = selectedTags.some(
        (tag) => normalizeTagKey(tag.key) === normalizedTagKey,
      );

      if (tagAlreadySelected) {
        setError(TagError.TAG_ALREADY_ADDED);
        return null;
      }

      if (existingTag) {
        setError(null);
        return existingTag;
      }

      setError(null);

      return {
        id: -Date.now(),
        key: normalizedTagKey,
      };
    },
    [allTags],
  );

  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

  useEffect(() => {
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
