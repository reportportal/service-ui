import PropTypes from 'prop-types';

import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { LaunchFiltersContainer } from 'pages/inside/common/launchFiltersContainer/launchFiltersContainer';
import { LaunchFiltersToolbar } from 'pages/inside/common/launchFiltersToolbar';

export const LaunchFiltersSection = ({ level }) => (
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
        level={level}
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
LaunchFiltersSection.propTypes = {
  level: PropTypes.string.isRequired,
};
