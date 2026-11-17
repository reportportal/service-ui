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

export type ProjectActivityHistoryItem<
  Field extends string = string,
  Value extends string = string,
> = {
  field: Field;
  oldValue: Value;
  newValue: Value;
};

interface ProjectActivityDetails<
  HistoryItem extends ProjectActivityHistoryItem = ProjectActivityHistoryItem,
> {
  history: Array<HistoryItem>;
}

export interface ProjectActivityLinkContext {
  organizationSlug?: string;
  projectSlug?: string;
}

export interface ProjectActivityActor {
  user: string;
}

export interface ProjectActivityItemBase<
  ActionType extends string = string,
  HistoryItem extends ProjectActivityHistoryItem = ProjectActivityHistoryItem,
>
  extends ProjectActivityActor, ProjectActivityLinkContext {
  actionType: ActionType;
  details?: ProjectActivityDetails<HistoryItem> | null;
  objectName?: string;
}

export const getActivityHistory = <
  HistoryItem extends ProjectActivityHistoryItem = ProjectActivityHistoryItem,
>(activity: {
  details?: ProjectActivityDetails<HistoryItem> | null;
}) => {
  return activity.details?.history ?? [];
};
