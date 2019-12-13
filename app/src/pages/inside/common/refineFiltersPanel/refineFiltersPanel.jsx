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
  events,
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
      events={events}
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
  events: PropTypes.object,
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
  events: {},
};
