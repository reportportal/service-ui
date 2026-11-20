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

export const IMAGE_REQUEST_GROUP = {
  MEMBERS_LIST_AVATARS: 'members-list-avatars',
} as const;

type CancelHandler = () => void;

const groups = new Map<string, Set<CancelHandler>>();

export const registerImageRequest = (group: string, cancel: CancelHandler): (() => void) => {
  const handlers = groups.get(group) ?? new Set<CancelHandler>();

  handlers.add(cancel);
  groups.set(group, handlers);

  return () => {
    handlers.delete(cancel);

    if (handlers.size === 0 && groups.get(group) === handlers) {
      groups.delete(group);
    }
  };
};

export const cancelImageRequestGroup = (group: string): void => {
  groups.get(group)?.forEach((cancel) => cancel());
};