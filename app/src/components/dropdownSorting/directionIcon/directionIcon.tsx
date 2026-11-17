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

import { FC } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@reportportal/ui-kit';
import { SORTING_ASC } from 'controllers/sorting';
import { SortingDirection } from 'controllers/sorting/types';

interface DirectionIconProps {
  direction?: SortingDirection;
}

export const DirectionIcon: FC<DirectionIconProps> = ({ direction = SORTING_ASC }) => {
  return direction === SORTING_ASC ? <ArrowUpIcon /> : <ArrowDownIcon />;
};
