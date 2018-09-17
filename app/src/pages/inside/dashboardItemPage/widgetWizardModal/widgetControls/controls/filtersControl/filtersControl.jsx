import React, { Component } from 'react';
import { connect } from 'react-redux';
import { touch, change, formValueSelector } from 'redux-form';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { userIdSelector } from 'controllers/user';
import { fetchFiltersAction } from 'controllers/filter';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';

import styles from './filtersControl.scss';
import { FiltersHeader } from './filtersHeader';
import { FiltersWrapper } from './filtersWrapper';
import { FieldProvider } from 'components/fields/fieldProvider';
import { WIDGET_WIZARD_FORM } from '../../../widgetWizardContent/wizardControlsSection/constants';

import { FiltersItem } from './filtersItem';

const cx = classNames.bind(styles);
const selector = formValueSelector(WIDGET_WIZARD_FORM);

@connect(
  (state) => ({
    userId: userIdSelector(state),
    form: state.form[WIDGET_WIZARD_FORM],
    activeFilterId: selector(state, 'filterItem'),
    filters: state.filters,
  }),
  {
    changeWizardForm: (field, value) => change(WIDGET_WIZARD_FORM, field, value, null),
    touchField: () => touch(WIDGET_WIZARD_FORM, 'filterItem'),
    fetchFiltersAction,
  },
)
export class FiltersControl extends Component {
  static propTypes = {
    activeFilterId: PropTypes.string,
    form: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    touchField: PropTypes.func.isRequired,
    changeWizardForm: PropTypes.func.isRequired,
    fetchFiltersAction: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    activeFilterId: '',
    filters: {
      loading: false,
    },
    touchField: () => {},
    changeWizardForm: () => {},
    fetchFiltersAction: () => {},
  };

  componentDidMount() {
    this.props.fetchFiltersAction();
  }

  handleFilterSelect = (event) => {
    const { touchField, changeWizardForm } = this.props;

    touchField();
    changeWizardForm('filterItem', event.target.value);
  };

  render() {
    const {
      userId,
      activeFilterId,
      filters: { filters, loading },
    } = this.props;

    const selectedFilter = filters.find((elem) => elem.id === activeFilterId);

    return (
      <div className={cx('filters-control')}>
        <FiltersHeader />
        <FieldProvider name={'filterItem'}>
          <FiltersWrapper filter={selectedFilter || false} />
        </FieldProvider>
        {filters.length && loading ? (
          <SpinningPreloader />
        ) : (
          <ScrollWrapper>
            {filters.map((item) => (
              <FiltersItem
                userId={userId}
                filter={item}
                activeFilterId={activeFilterId}
                key={item.id}
                onChange={this.handleFilterSelect}
              />
            ))}
          </ScrollWrapper>
        )}
      </div>
    );
  }
}
