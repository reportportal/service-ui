import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import styles from './refineFiltersPanel.scss';

const cx = classNames.bind(styles);

export const RefineFiltersPanel = ({
  onFilterAdd,
  onFilterRemove,
  onFilterValidate,
  onFilterChange,
  filterErrors,
  filterEntities,
}) => (
  <div className={cx('refine-filters-panel')}>
    <div className={cx('label')}>
      <FormattedMessage id="Filters.refine" defaultMessage="Refine:" />
    </div>
    <EntitiesGroup
      onChange={onFilterChange}
      onValidate={onFilterValidate}
      onRemove={onFilterRemove}
      onAdd={onFilterAdd}
      errors={filterErrors}
      entities={filterEntities}
    />
  </div>
);
RefineFiltersPanel.propTypes = {
  entitiesComponent: PropTypes.func,
  updateFilters: PropTypes.func,
  onFilterAdd: PropTypes.func,
  onFilterRemove: PropTypes.func,
  onFilterValidate: PropTypes.func,
  onFilterChange: PropTypes.func,
  filterErrors: PropTypes.object,
  filterEntities: PropTypes.array,
};
RefineFiltersPanel.defaultProps = {
  entitiesComponent: null,
  updateFilters: () => {},
  onFilterAdd: () => {},
  onFilterRemove: () => {},
  onFilterValidate: () => {},
  onFilterChange: () => {},
  filterErrors: {},
  filterEntities: [],
};
