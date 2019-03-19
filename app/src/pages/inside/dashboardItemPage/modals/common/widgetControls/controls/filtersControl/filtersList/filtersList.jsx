import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';
import { NoFiltersFound } from 'pages/inside/common/noResultsForFilter';
import styles from './filtersList.scss';
import { FiltersItem } from '../filtersItem';
import { FORM_APPEARANCE_MODE_EDIT } from '../common/constants';

const cx = classNames.bind(styles);

export const FiltersList = ({
  search,
  userId,
  activeId,
  filters,
  loading,
  onChange,
  onEdit,
  onLazyLoad,
  noItemsMessage,
}) => (
  <div className={cx('filter-list')}>
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
      {!filters.length &&
        !loading && <NoFiltersFound filter={search || ''} notFoundMessage={noItemsMessage} />}
    </ScrollWrapper>
  </div>
);

FiltersList.propTypes = {
  userId: PropTypes.string,
  search: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  activeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  loading: PropTypes.bool,
  filters: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onEdit: PropTypes.func,
  onLazyLoad: PropTypes.func,
  noItemsMessage: PropTypes.object,
};

FiltersList.defaultProps = {
  userId: '',
  search: '',
  loading: false,
  onChange: () => {},
  onEdit: () => {},
  onLazyLoad: null,
  noItemsMessage: {},
};
