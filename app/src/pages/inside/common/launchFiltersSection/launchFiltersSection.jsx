import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { LaunchFiltersContainer } from 'pages/inside/common/launchFiltersContainer/launchFiltersContainer';
import { LaunchFiltersToolbar } from 'pages/inside/common/launchFiltersToolbar';
import { LEVEL_LAUNCH } from 'common/constants/launchLevels';

export const LaunchFiltersSection = () => (
  <LaunchFiltersContainer
    render={({
      launchFilters,
      activeFilterId,
      activeFilter,
      activeFilterEntities,
      onSelectFilter,
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
            onSelectFilter={onSelectFilter}
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
