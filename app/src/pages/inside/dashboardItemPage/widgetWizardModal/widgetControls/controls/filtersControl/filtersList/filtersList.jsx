import React from 'react';
import PropTypes from 'prop-types';

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';

import { FiltersItem } from '../filtersItem/filtersItem';
import { FORM_APPEARANCE_MODE_EDIT } from '../constants';

export const FiltersList = ({
  search,
  userId,
  activeId,
  filters,
  loading,
  onChange,
  onEdit,
  onLazyLoad,
}) => (
  <ScrollWrapper onLazyLoad={onLazyLoad}>
    {filters.map((item) => (
      <FiltersItem
        search={search || ''}
        userId={userId}
        filter={item}
        activeFilterId={activeId}
        key={item.id}
        onChange={onChange}
        onEdit={(event) => onEdit(event, FORM_APPEARANCE_MODE_EDIT, item)}
      />
    ))}
    {loading && <SpinningPreloader />}
  </ScrollWrapper>
);

FiltersList.propTypes = {
  userId: PropTypes.string,
  search: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  activeId: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  filters: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onEdit: PropTypes.func,
  onLazyLoad: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
};

FiltersList.defaultProps = {
  userId: '',
  search: '',
  loading: false,
  onChange: () => {},
  onEdit: () => {},
  onLazyLoad: false,
};
