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

import { FC } from "react";

export type DisabledButtons = 'all' | 'add' | 'prev' | 'none' | null;

export interface Widget {
  id: string | number;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controls?: FC<any>;
  convertOutput?: (data: Record<string, unknown>) => Record<string, unknown>;
}

export interface Condition {
  filteringField: string;
  value: string;
  condition?: string;
}

export interface Order {
  sortingColumn: string;
  isAsc: boolean;
}

export interface ContentParameters {
  contentFields?: unknown;
  widgetOptions?: {
    separateInterrupted?: unknown;
    viewMode?: string;
    launchNameFilter?: string;
    [key: string]: unknown;
  };
}

export interface Filter {
  id?: number | string;
  name?: string;
  description?: string;
  conditions?: Condition[];
  orders?: Order[];
  [key: string]: unknown;
}
