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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { injectIntl } from 'react-intl';
import { addFilteringFieldToConditions } from 'controllers/filter';
import { LEVEL_LAUNCH } from 'common/constants/launchLevels';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { BigButton } from 'components/buttons/bigButton';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import { FiltersSorting } from 'pages/inside/common/filtersSorting';
import { ENTITY_NUMBER } from 'components/filterEntities/constants';
import styles from './addEditFilter.scss';

const cx = classNames.bind(styles);

@track()
@injectIntl
export class AddEditFilter extends Component {
  static propTypes = {
    intl: PropTypes.object,
    filter: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    isValid: PropTypes.bool,
    blockTitle: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    customBlock: PropTypes.element,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    intl: {},
    isValid: true,
    blockTitle: null,
    customBlock: null,
    onSubmit: () => {},
    onCancel: () => {},
    onChange: () => {},
    eventsInfo: {},
  };

  getFilterEntities = () => {
    const { filter } = this.props;

    if (filter.conditions) {
      return filter.conditions.reduce(
        (prev, current) => ({ ...prev, [current.filteringField]: current }),
        {},
      );
    }

    return {};
  };

  handleEntitiesChange = (conditions) => {
    const { filter, onChange, tracking, eventsInfo } = this.props;

    tracking.trackEvent(eventsInfo.selectParamsForFilter);
    onChange({
      ...filter,
      conditions: addFilteringFieldToConditions(conditions),
    });
  };

  handleOrdersChange = (newSortingColumn) => {
    const { filter, onChange, tracking, eventsInfo } = this.props;
    const { orders } = filter;

    const currentOrder = filter.orders.length ? filter.orders[0] : {};
    const { sortingColumn, isAsc } = currentOrder;

    const sortObject = {
      sortingColumn: newSortingColumn,
      isAsc: sortingColumn === newSortingColumn ? !isAsc : true,
    };

    const newOrders = [sortObject];
    const numberColumnIndex = orders.findIndex((o) => o.sortingColumn === ENTITY_NUMBER);
    if (numberColumnIndex >= 0) {
      newOrders.push(orders[numberColumnIndex]);
    }

    tracking.trackEvent(eventsInfo.sortingSelectParameters);
    onChange({
      ...filter,
      orders: newOrders,
    });
  };

  checkIfTheAbleToSubmit = () => {
    const {
      filter: { conditions = [] },
      isValid,
    } = this.props;
    const filteredConditions = conditions.filter((item) => item.value.trim());

    return isValid && filteredConditions.length;
  };

  render() {
    const { intl, onCancel, filter, onSubmit, customBlock, blockTitle } = this.props;
    const isAbleToSubmit = this.checkIfTheAbleToSubmit();

    return (
      <div className={cx('add-edit-filter')}>
        <h2 className={cx('block-title')}>{intl.formatMessage(blockTitle)}</h2>
        {customBlock}
        <div className={cx('filters-block')}>
          <FilterEntitiesContainer
            level={LEVEL_LAUNCH}
            onChange={this.handleEntitiesChange}
            entities={this.getFilterEntities()}
            render={({
              onFilterAdd,
              onFilterRemove,
              onFilterValidate,
              onFilterChange,
              filterErrors,
              filterEntities,
            }) => (
              <EntitiesGroup
                onChange={onFilterChange}
                onValidate={onFilterValidate}
                onRemove={onFilterRemove}
                onAdd={onFilterAdd}
                errors={filterErrors}
                entities={filterEntities}
                entitySmallSize
              />
            )}
          />
          <FiltersSorting filter={filter} onChange={this.handleOrdersChange} />
          <div className={cx('filter-buttons-block')}>
            <BigButton color={'gray-60'} onClick={onCancel} className={cx('button-inline')}>
              {intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
            </BigButton>
            <BigButton
              className={cx('button-inline')}
              onClick={onSubmit}
              disabled={!isAbleToSubmit}
            >
              {intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
            </BigButton>
          </div>
        </div>
      </div>
    );
  }
}
