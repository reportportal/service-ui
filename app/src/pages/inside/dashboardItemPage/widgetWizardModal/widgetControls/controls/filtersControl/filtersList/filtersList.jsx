import React from 'react';
import PropTypes from 'prop-types';

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';

import { FiltersItem } from '../filtersItem/filtersItem';

export const FiltersList = ({ userId, activeId, filters, loading, onChange, onLazyLoad }) => (
  <ScrollWrapper onLazyLoad={onLazyLoad}>
    {filters.map((item) => (
      <FiltersItem
        userId={userId}
        filter={item}
        activeFilterId={activeId}
        key={item.id}
        onChange={onChange}
      />
    ))}
    {loading && <SpinningPreloader />}
  </ScrollWrapper>
);

FiltersList.propTypes = {
  userId: PropTypes.string,
  activeId: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  filters: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onLazyLoad: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
};

FiltersList.defaultProps = {
  userId: '',
  loading: false,
  onChange: () => {},
  onLazyLoad: false,
};
