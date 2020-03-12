/*
 * Copyright 2019 EPAM Systems
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

import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { LaunchFiltersContainer } from 'pages/inside/common/launchFiltersContainer';
import { LaunchFiltersToolbar } from 'pages/inside/common/launchFiltersToolbar';
import { LEVEL_LAUNCH } from 'common/constants/launchLevels';

export const LaunchFiltersSection = () => (
  <LaunchFiltersContainer
    render={({
      launchFilters,
      activeFilterId,
      activeFilter,
      activeFilterEntities,
      onRemoveFilter,
      onChangeFilter,
      onResetFilter,
    }) => (
      <FilterEntitiesContainer
        level={LEVEL_LAUNCH}
        filterId={activeFilterId}
        entities={activeFilterEntities}
        onChange={onChangeFilter}
        render={({ onFilterAdd: onTopFilterAdd, ...rest }) => (
          <LaunchFiltersToolbar
            filters={launchFilters}
            activeFilterId={activeFilterId}
            activeFilter={activeFilter}
            onRemoveFilter={onRemoveFilter}
            onFilterAdd={onTopFilterAdd}
            onResetFilter={onResetFilter}
            {...rest}
          />
        )}
      />
    )}
  />
);
