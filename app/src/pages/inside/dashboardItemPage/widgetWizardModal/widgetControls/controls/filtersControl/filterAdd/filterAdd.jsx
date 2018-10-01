import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';

import { BigButton } from 'components/buttons/bigButton';
import { filterName } from 'common/utils/validation';
import { LaunchLevelEntities } from 'pages/inside/common/filterEntitiesGroups/launchLevelEntities';
import { ENTITY_NAME, CONDITION_CNT, ENTITY_START_TIME } from 'components/filterEntities/constants';

import { FILTER_ADD_FORM, getOrdersWithDefault } from '../constants';
import { FilterAddInput } from './filterAddInput';
import { FiltersSorting } from '../filtersSorting';

import styles from './filterAdd.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  cancelButton: {
    id: 'AddFilter.cancelButton',
    defaultMessage: 'Cancel',
  },
  submitButton: {
    id: 'AddFilter.submitButton',
    defaultMessage: 'Submit',
  },
});

@injectIntl
@connect(() => ({
  initialValues: {
    share: '',
    type: 'launch',
    entities: [{ value: '', condition: CONDITION_CNT, filtering_field: ENTITY_NAME }],
    selection_parameters: {
      orders: getOrdersWithDefault(ENTITY_START_TIME),
    },
  },
}))
@reduxForm({
  form: FILTER_ADD_FORM,
  validate: (values, { filter, onChange }) => {
    onChange({
      filter,
      ...values,
    });

    if (!values.name || !filterName(values.name)) {
      return { name: 'filterNameError' };
    }

    return true;
  },
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})
export class FilterAdd extends Component {
  static propTypes = {
    intl: intlShape,
    filter: PropTypes.object.isRequired,
    defectTypes: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    intl: {},
    defectTypes: {},
    validate: () => {},
    handleSubmit: () => {},
    onSave: () => {},
    onCancel: () => {},
    onChange: () => {},
  };

  getFilterEntities = () => {
    const { filter } = this.props;

    if (filter.entities) {
      return filter.entities.reduce(
        (prev, current) => ({ ...prev, [current.filtering_field]: current }),
        { [ENTITY_NAME]: { value: '', condition: CONDITION_CNT } },
      );
    }

    return {};
  };

  handleEntitiesChange = ({ entities }) => {
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
    const { intl, onCancel, handleSubmit, filter, onSave } = this.props;

    return (
      <div className={cx('filter-add')}>
        <h2 className={cx('filter-add-title')}>Add new filter</h2>
        <FilterAddInput intl={intl} />
        <div className={cx('filter-add-block')}>
          <LaunchLevelEntities
            entitySmallSize
            entities={this.getFilterEntities()}
            onChange={this.handleEntitiesChange}
          />
          <FiltersSorting filter={filter} onChange={this.handleOrdersChange} />
          <div className={cx('filter-add-buttons-block')}>
            <BigButton color={'gray-60'} onClick={onCancel} className={cx('button-inline')}>
              {intl.formatMessage(messages.cancelButton)}
            </BigButton>
            <BigButton
              type={'submit'}
              color={'booger'}
              onClick={handleSubmit(onSave)}
              className={cx('button-inline')}
            >
              {intl.formatMessage(messages.submitButton)}
            </BigButton>
          </div>
        </div>
      </div>
    );
  }
}
