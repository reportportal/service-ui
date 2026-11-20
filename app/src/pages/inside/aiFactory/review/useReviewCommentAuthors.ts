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

import { useEffect, useMemo, useState } from 'react';
import { chunk } from 'es-toolkit';
import { useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { userInfoSelector } from 'controllers/user';
import type { UserInfo } from 'controllers/user/types';
import type { ReviewCommentRS } from 'types/aiFactory';

type AuthorProfile = Pick<UserInfo, 'id' | 'fullName' | 'userId'>;

interface AuthorLookup {
  projectKey: string;
  currentUserId?: number;
  names: Map<number, string>;
}

const getDisplayName = (user: Partial<AuthorProfile>) =>
  user.fullName?.trim() || user.userId?.trim();

const fetchAuthorNames = async (projectKey: string, ids: string[], signal: AbortSignal) => {
  const response = await fetch<{ content: AuthorProfile[] }>(URLS.projectUsers(projectKey), {
    params: { 'filter.in.id': ids.join(','), 'page.size': ids.length },
    signal,
  });
  const names = new Map<number, string>();
  for (const user of response.content) {
    const name = getDisplayName(user);
    if (name && ids.includes(String(user.id))) names.set(user.id, name);
  }
  return names;
};

export const useReviewCommentAuthors = (projectKey: string, comments: ReviewCommentRS[]) => {
  const profile: Partial<AuthorProfile> = useSelector(userInfoSelector) ?? {};
  const currentUserId = profile.id;
  const currentUserName = getDisplayName(profile);
  const [lookup, setLookup] = useState<AuthorLookup>();
  const authorIds = useMemo(() => {
    const ids = comments
      .filter(({ author }) => !author.name && !(author.id === currentUserId && currentUserName))
      .map(({ author }) => author.id);
    return [...new Set(ids)].sort((left, right) => left - right).join(',');
  }, [comments, currentUserId, currentUserName]);

  useEffect(() => {
    if (!projectKey || !authorIds) return undefined;

    const controller = new AbortController();
    const batches = chunk(authorIds.split(','), 50);
    void Promise.allSettled(
      batches.map((ids) => fetchAuthorNames(projectKey, ids, controller.signal)),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const names = new Map(
        results.flatMap((result) => (result.status === 'fulfilled' ? [...result.value] : [])),
      );
      setLookup({ projectKey, currentUserId, names });
    });

    return () => controller.abort();
  }, [authorIds, currentUserId, projectKey]);

  const names =
    lookup?.projectKey === projectKey && lookup.currentUserId === currentUserId
      ? lookup.names
      : undefined;
  return useMemo(
    () =>
      comments.map((comment) => {
        const { author } = comment;
        if (author.name) return comment;
        const name =
          (author.id === currentUserId ? currentUserName : undefined) || names?.get(author.id);
        return name ? { ...comment, author: { ...author, name } } : comment;
      }),
    [comments, currentUserId, currentUserName, names],
  );
};
