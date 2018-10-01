import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';

import { InputRadio } from 'components/inputs/inputRadio';
import { BigButton } from 'components/buttons/bigButton';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import { LEVEL_LAUNCH } from 'common/constants/launchLevels';

import { FiltersSorting } from '../filtersSorting';
import styles from './filterEdit.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  cancelButton: {
    id: 'EditFilter.cancelButton',
    defaultMessage: 'Cancel',
  },
  submitButton: {
    id: 'EditFilter.submitButton',
    defaultMessage: 'Submit',
  },
});

@injectIntl
export class FilterEdit extends Component {
  static propTypes = {
    intl: intlShape,
    filter: PropTypes.object.isRequired,
    defectTypes: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    intl: {},
    defectTypes: {},
    onSave: () => {},
    onCancel: () => {},
    onChange: () => {},
  };

  onFilterSave = () => this.props.onSave(this.props.filter);

  getFilterEntities = () => {
    const { filter } = this.props;

    if (filter.entities) {
      return filter.entities.reduce(
        (prev, current) => ({ ...prev, [current.filtering_field]: current }),
        {},
      );
    }

    return {};
  };

  handleEntitiesChange = (entities) => {
    const { filter, onChange } = this.props;

    onChange({
      ...filter,
      entities: Object.values(entities),
    });
  };

  handleOrdersChange = (selectionParameters) => {
    const { filter, onChange } = this.props;

    onChange({
      ...filter,
      selection_parameters: selectionParameters,
    });
  };

  render() {
    const { intl, filter, onCancel } = this.props;

    return (
      <div className={cx('filter-edit')}>
        <h2 className={cx('filter-edit-title')}>Edit filter</h2>
        <div className={cx('filter-edit-header')}>
          <InputRadio value={filter.id} ownValue={filter.id} name={'filter-item'} circleAtTop>
            {filter.name}
          </InputRadio>
        </div>
        <div className={cx('filter-edit-block')}>
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
          <div className={cx('filter-edit-buttons-block')}>
            <BigButton color={'gray-60'} onClick={onCancel} className={cx('button-inline')}>
              {intl.formatMessage(messages.cancelButton)}
            </BigButton>
            <BigButton color={'booger'} onClick={this.onFilterSave} className={cx('button-inline')}>
              {intl.formatMessage(messages.submitButton)}
            </BigButton>
          </div>
        </div>
      </div>
    );
  }
}
