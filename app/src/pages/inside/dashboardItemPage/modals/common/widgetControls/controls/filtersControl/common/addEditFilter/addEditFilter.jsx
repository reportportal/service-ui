import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { addFilteringFieldToConditions } from 'controllers/filter';
import { LEVEL_LAUNCH } from 'common/constants/launchLevels';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { BigButton } from 'components/buttons/bigButton';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import { FiltersSorting } from '../../filtersSorting';
import styles from './addEditFilter.scss';

const cx = classNames.bind(styles);

@injectIntl
export class AddEditFilter extends Component {
  static propTypes = {
    intl: intlShape,
    filter: PropTypes.object.isRequired,
    canSubmit: PropTypes.bool,
    blockTitle: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    customBlock: PropTypes.element,
  };

  static defaultProps = {
    intl: {},
    canSubmit: true,
    blockTitle: null,
    customBlock: null,
    onSubmit: () => {},
    onCancel: () => {},
    onChange: () => {},
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
    const { filter, onChange } = this.props;

    onChange({
      ...filter,
      conditions: addFilteringFieldToConditions(conditions),
    });
  };

  handleOrdersChange = (orders) => {
    const { filter, onChange } = this.props;

    onChange({
      ...filter,
      orders,
    });
  };

  render() {
    const { intl, onCancel, filter, onSubmit, canSubmit, customBlock, blockTitle } = this.props;

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
            <BigButton className={cx('button-inline')} onClick={onSubmit} disabled={!canSubmit}>
              {intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
            </BigButton>
          </div>
        </div>
      </div>
    );
  }
}
